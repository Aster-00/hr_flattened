import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SystemRole } from 'src/employee-profile/enums/employee-profile.enums';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

import { JobRequisition, JobRequisitionDocument } from './Models/job-requisition.schema';
import { Application, ApplicationDocument } from './Models/application.schema';
import { Interview, InterviewDocument } from './Models/interview.schema';
import { AssessmentResult, AssessmentResultDocument } from './Models/assessment-result.schema';
import { Offer, OfferDocument } from './Models/offer.schema';
import { ApplicationStatusHistory, ApplicationStatusHistoryDocument } from './Models/application-history.schema';
import { Referral, ReferralDocument } from './Models/referral.schema';
import { Candidate, CandidateDocument } from '../employee-profile/Models/candidate.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/Models/employee-profile.schema';
import { Onboarding, OnboardingDocument } from './Models/onboarding.schema';
import { Contract, ContractDocument } from './Models/contract.schema';
import { JobTemplate, JobTemplateDocument } from './Models/job-template.schema';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UploadTaskDocumentDto } from './dto/upload-task-document.dto';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';
import { ApplicationStage } from './enums/application-stage.enum';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';
import { ApplicationStatus } from './enums/application-status.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { InterviewMethod } from './enums/interview-method.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import { ApproverRole, FINANCIAL_APPROVAL_THRESHOLDS } from './enums/approver-role.enum';
import { NotificationsService } from '../leaves/notifications/notifications.service';
import { RequestsService } from '../leaves/requests/requests.service';
import PDFDocument from 'pdfkit';
import { createWriteStream, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(
    @InjectModel(JobRequisition.name) private jobRequisitionModel: Model<JobRequisitionDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    @InjectModel(AssessmentResult.name) private assessmentResultModel: Model<AssessmentResultDocument>,
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
    @InjectModel(ApplicationStatusHistory.name) private applicationHistoryModel: Model<ApplicationStatusHistoryDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(Onboarding.name) private onboardingModel: Model<OnboardingDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
    private notificationService: NotificationsService,
    private requestsService: RequestsService,
  ) { }

  /**
   * Helper method to manually populate panel members for interviews
   * This ensures panel members are always properly populated even if Mongoose populate fails
   */
  private async populatePanelMembers(interviews: InterviewDocument[]): Promise<InterviewDocument[]> {
    for (const interview of interviews) {
      if (interview.panel && interview.panel.length > 0) {
        const populatedPanel: Array<{
          _id: any;
          firstName: string;
          lastName: string;
          workEmail: string;
          employeeNumber: string;
        }> = [];
        for (const panelMemberId of interview.panel) {
          // Get the ID regardless of whether it's already an object or just an ObjectId
          const memberId = (panelMemberId as any)?._id || panelMemberId;
          
          try {
            const employee = await this.employeeProfileModel
              .findById(memberId)
              .select('firstName lastName workEmail employeeNumber')
              .lean()
              .exec();
            
            if (employee) {
              populatedPanel.push({
                _id: memberId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                workEmail: employee.workEmail || '',
                employeeNumber: employee.employeeNumber,
              });
            } else {
              // If employee not found, add a placeholder with the ID
              this.logger.warn(`Panel member ${memberId} not found in EmployeeProfile collection`);
              populatedPanel.push({
                _id: memberId,
                firstName: 'Unknown',
                lastName: 'Member',
                workEmail: '',
                employeeNumber: memberId.toString(),
              });
            }
          } catch (error) {
            this.logger.error(`Error fetching panel member ${memberId}: ${error.message}`);
            populatedPanel.push({
              _id: memberId,
              firstName: 'Unknown',
              lastName: 'Member',
              workEmail: '',
              employeeNumber: memberId.toString(),
            });
          }
        }
        // Replace panel with populated data
        (interview as any).panel = populatedPanel;
      }
    }
    return interviews;
  }

  /**
   * Helper method to populate panel members for a single interview
   */
  private async populateSingleInterviewPanel(interview: InterviewDocument): Promise<InterviewDocument> {
    const result = await this.populatePanelMembers([interview]);
    return result[0];
  }

  /**
   * REC-027: Normalize role string for comparison
   * Handles different formats: "HR_MANAGER", "HR Manager", "hr_manager", etc.
   */
  private normalizeRole(role: string): string {
    return role
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * REC-027: Check if a role matches a required role (case-insensitive, format-agnostic)
   * Also handles role aliases (e.g., "Department Manager" = "Hiring Manager")
   */
  private roleMatches(approverRole: string, requiredRole: string): boolean {
    const normalizedApprover = this.normalizeRole(approverRole);
    const normalizedRequired = this.normalizeRole(requiredRole);

    // Direct match
    if (normalizedApprover === normalizedRequired) {
      return true;
    }

    // Role aliases - these roles are considered equivalent
    const roleAliases: Record<string, string[]> = {
      'hiring manager': ['department manager', 'dept manager', 'manager'],
      'hr manager': ['hr_manager', 'human resources manager'],
      'department head': ['dept head', 'head of department'],
      'finance': ['finance manager', 'financial approver', 'finance department'],
    };

    // Check if the approver role matches any alias of the required role
    const aliases = roleAliases[normalizedRequired] || [];
    return aliases.includes(normalizedApprover);
  }

  /**
   * REC-027: Validate that required approvers are present based on salary level
   * BR 26b: The system must support securing related parties' approval before sending out the offer
   *
   * @param grossSalary - The offer salary to determine approval requirements
   * @param approvers - The list of approvers provided in the offer
   * @returns Object with validation result and missing roles if any
   */
  private validateRequiredApprovers(
    grossSalary: number,
    approvers: { employeeId: any; role: string }[]
  ): { isValid: boolean; missingRoles: string[]; requiredRoles: string[] } {
    const requiredRoles: string[] = [];
    const missingRoles: string[] = [];

    // All offers require HR Manager and Hiring Manager approval
    requiredRoles.push(ApproverRole.HR_MANAGER, ApproverRole.HIRING_MANAGER);

    // REC-027: Financial Approval - Salary-based approval requirements
    if (grossSalary > FINANCIAL_APPROVAL_THRESHOLDS.STANDARD_MAX) {
      // Senior level - requires Finance approval
      requiredRoles.push(ApproverRole.FINANCE);
    }

    if (grossSalary > FINANCIAL_APPROVAL_THRESHOLDS.SENIOR_MAX) {
      // Executive level - requires Department Head approval
      requiredRoles.push(ApproverRole.DEPARTMENT_HEAD);
    }

    // Check which required roles are missing (with flexible matching)
    const approverRoles = approvers?.map(a => a.role) || [];
    for (const requiredRole of requiredRoles) {
      const hasRole = approverRoles.some(ar => this.roleMatches(ar, requiredRole));
      if (!hasRole) {
        missingRoles.push(requiredRole);
      }
    }

    return {
      isValid: missingRoles.length === 0,
      missingRoles,
      requiredRoles,
    };
  }

  /**
   * REC-027: Get required approver roles based on salary
   * Helper method for frontend to know which approvers are needed
   *
   * @param grossSalary - The proposed salary
   * @returns Array of required approver roles
   */
  getRequiredApproverRoles(grossSalary: number): string[] {
    const requiredRoles: string[] = [ApproverRole.HR_MANAGER, ApproverRole.HIRING_MANAGER];

    if (grossSalary > FINANCIAL_APPROVAL_THRESHOLDS.STANDARD_MAX) {
      requiredRoles.push(ApproverRole.FINANCE);
    }

    if (grossSalary > FINANCIAL_APPROVAL_THRESHOLDS.SENIOR_MAX) {
      requiredRoles.push(ApproverRole.DEPARTMENT_HEAD);
    }

    return requiredRoles;
  }

  /**
   * Create a new job requisition based on a job template
   * Business Rule (BR 2): Each job requisition must include job details (title, department, location, openings)
   * and qualifications and skills (from template)
   */
  async createJobRequisition(createJobRequisitionDto: CreateJobRequisitionDto): Promise<JobRequisitionDocument> {
    const {
      requisitionId,
      templateId,
      location,
      openings,
      hiringManagerId,
      expiryDate,
    } = createJobRequisitionDto;

    // Validate that the template exists
    // Note: In a complete implementation, you would validate the template exists
    // For now, we trust the templateId is valid

    // Create the job requisition
    const jobRequisition = new this.jobRequisitionModel({
      requisitionId,
      templateId,
      location,
      openings,
      hiringManagerId,
      expiryDate,
      publishStatus: 'draft', // Default status
    });

    const savedRequisition = await jobRequisition.save();

    // Populate the template to return complete job details
    return await savedRequisition.populate('templateId');
  }

  /**
   * Get all job requisitions with their template details
   */
  async getAllJobRequisitions(): Promise<JobRequisitionDocument[]> {
    return await this.jobRequisitionModel
      .find()
      .populate('templateId')
      .exec();
  }

  /**
   * Get a single job requisition by ID
   */
  async getJobRequisitionById(id: string): Promise<JobRequisitionDocument> {
    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .exec();

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    return requisition;
  }

  /**
   * Update job requisition
   */
  async updateJobRequisition(id: string, updateData: Partial<CreateJobRequisitionDto>): Promise<JobRequisitionDocument> {
    const requisition = await this.jobRequisitionModel.findById(id);

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    // Update fields if provided
    if (updateData.requisitionId !== undefined) requisition.requisitionId = updateData.requisitionId;
    if (updateData.templateId !== undefined) requisition.templateId = updateData.templateId as any;
    if (updateData.location !== undefined) requisition.location = updateData.location;
    if (updateData.openings !== undefined) requisition.openings = updateData.openings;
    if (updateData.hiringManagerId !== undefined) requisition.hiringManagerId = updateData.hiringManagerId as any;
    if (updateData.expiryDate !== undefined) requisition.expiryDate = updateData.expiryDate;

    return await requisition.save();
  }

  /**
   * Update job requisition publish status
   */
  async updateJobRequisitionStatus(id: string, status: 'draft' | 'published' | 'closed'): Promise<JobRequisitionDocument> {
    const requisition = await this.jobRequisitionModel.findById(id);

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    requisition.publishStatus = status;

    if (status === 'published' && !requisition.postingDate) {
      requisition.postingDate = new Date();
    }

    return await requisition.save();
  }

  /**
   * Delete job requisition
   */
  async deleteJobRequisition(id: string): Promise<void> {
    const requisition = await this.jobRequisitionModel.findById(id);

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    // Check if there are any applications associated with this requisition
    const applicationsCount = await this.applicationModel.countDocuments({ jobRequisitionId: id });

    if (applicationsCount > 0) {
      throw new BadRequestException(
        `Cannot delete job requisition with ${applicationsCount} associated application(s). Please close the requisition instead.`
      );
    }

    await this.jobRequisitionModel.findByIdAndDelete(id);
  }

  /**
   * Update application stage and automatically calculate progress percentage
   * Business Rule (BR 9): Each application must be tracked through defined stages
   * (e.g., Screening, Department Interview, HR Interview, Offer)
   * Business Rule (BR 11): Recruiters and hiring managers must be notified of status changes
   * Business Rule (BR 27, BR 36): Send automated alerts/emails to candidates regarding status updates
   */
  async updateApplicationStage(
    applicationId: string,
    newStage: ApplicationStage,
    notes?: string,
    changedBy?: string,
  ): Promise<{ application: ApplicationDocument, progress: number, emailNotification: { email: string; name: string; subject: string; message: string } | null }> {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('requisitionId')
      .populate('candidateId')
      .populate('assignedHr');

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    const oldStage = application.currentStage;

    // Define the standard hiring stages in order
    const hiringStages = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    // Validate that the new stage exists in the defined stages
    if (!hiringStages.includes(newStage)) {
      throw new BadRequestException(`Invalid stage: ${newStage}. Must be one of: ${Object.values(ApplicationStage).join(', ')}`);
    }

    // Calculate progress percentage based on stage position
    const stageIndex = hiringStages.indexOf(newStage);
    const progress = ((stageIndex + 1) / hiringStages.length) * 100;

    // Update the application's current stage
    application.currentStage = newStage;

    await application.save();

    // Re-populate the application after save to get fresh populated data
    const updatedApplication = await this.applicationModel
      .findById(applicationId)
      .populate({
        path: 'requisitionId',
        populate: {
          path: 'templateId'
        }
      })
      .populate('candidateId')
      .populate('assignedHr')
      .exec();

    if (!updatedApplication) {
      throw new NotFoundException(`Application with ID ${applicationId} not found after update`);
    }

    // Create history record for the stage change
    const historyRecord = new this.applicationHistoryModel({
      applicationId: new Types.ObjectId(applicationId),
      oldStage,
      newStage,
      changedBy: changedBy ? new Types.ObjectId(changedBy) : undefined,
      changedAt: new Date(),
      notes: notes || `Stage updated to ${newStage}`,
    });

    await historyRecord.save();

    // Prepare common notification data using the updated populated application
    const jobRequisition = updatedApplication.requisitionId as any;
    const candidate = updatedApplication.candidateId as any;
    const jobTitle = jobRequisition?.templateId?.title || 'the position';
    const candidateName = candidate?.fullName || candidate?.name || `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'A candidate';

    // Send automated notification to candidate about status update
    try {
      const stageMessages: Record<ApplicationStage, string> = {
        [ApplicationStage.SCREENING]: `Your application for ${jobTitle} is currently being reviewed by our hiring team.`,
        [ApplicationStage.DEPARTMENT_INTERVIEW]: `Your application for ${jobTitle} has advanced to the department interview stage.`,
        [ApplicationStage.HR_INTERVIEW]: `Your application for ${jobTitle} has advanced to the HR interview stage.`,
        [ApplicationStage.OFFER]: `Great news! Your application for ${jobTitle} has progressed to the offer stage.`,
      };

      let message = stageMessages[newStage] || `Your application status for ${jobTitle} has been updated.`;
      if (notes) {
        message += ` Additional notes: ${notes}`;
      }

      await this.notificationService.emitForUser(
        candidate._id.toString(),
        'Application Status Update',
        message,
        { applicationId, stage: newStage, jobTitle },
      );

      this.logger.log(
        `Notification sent to candidate ${candidate._id} for application ${applicationId} stage update to ${newStage}`,
      );
    } catch (error) {
      // Log error but don't fail the stage update
      this.logger.error(
        `Failed to send candidate notification for application ${applicationId}: ${error.message}`,
      );
    }

    // Prepare email notification data for frontend to send via EmailJS
    const candidateEmail = candidate?.personalEmail || candidate?.email;
    const stageEmailMessages: Record<ApplicationStage, string> = {
      [ApplicationStage.SCREENING]: `We wanted to let you know that your application for the ${jobTitle} position is currently being reviewed by our hiring team. We appreciate your patience and will keep you updated on the progress.`,
      [ApplicationStage.DEPARTMENT_INTERVIEW]: `Great news! Your application for the ${jobTitle} position has advanced to the department interview stage. Our team will be in touch shortly to schedule your interview.`,
      [ApplicationStage.HR_INTERVIEW]: `Congratulations! Your application for the ${jobTitle} position has progressed to the HR interview stage. You will be contacted soon to arrange the next steps.`,
      [ApplicationStage.OFFER]: `Exciting news! Your application for the ${jobTitle} position has reached the offer stage. Please expect to receive more details about your offer shortly.`,
    };
    const emailMessage = stageEmailMessages[newStage] || `Your application status for ${jobTitle} has been updated to ${newStage}.`;

    const emailNotification = candidateEmail ? {
      email: candidateEmail,
      name: candidateName,
      subject: `Application Update - ${jobTitle}`,
      message: emailMessage,
    } : null;

    // REC-008 (BR 11): Notify assigned HR about candidate status change
    if (updatedApplication.assignedHr) {
      try {
        const hrMessage = `Candidate ${candidateName}'s application for ${jobTitle} has been moved to ${newStage} stage.${notes ? ` Notes: ${notes}` : ''}`;

        await this.notificationService.emitForUser(
          (updatedApplication.assignedHr as any)._id?.toString() || updatedApplication.assignedHr.toString(),
          'Candidate Status Update',
          hrMessage,
          { applicationId, candidateName, stage: newStage, jobTitle, oldStage },
        );

        this.logger.log(
          `Notification sent to HR ${updatedApplication.assignedHr} for application ${applicationId} stage update`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send HR notification for application ${applicationId}: ${error.message}`,
        );
      }
    }

    // REC-008 (BR 11): Notify hiring manager about candidate status change
    if (jobRequisition?.hiringManagerId) {
      try {
        const hmMessage = `Candidate ${candidateName}'s application for ${jobTitle} has progressed from ${oldStage} to ${newStage}.${notes ? ` Notes: ${notes}` : ''}`;

        await this.notificationService.emitForUser(
          jobRequisition.hiringManagerId._id?.toString() || jobRequisition.hiringManagerId.toString(),
          'Candidate Progress Update',
          hmMessage,
          { applicationId, candidateName, stage: newStage, jobTitle, oldStage },
        );

        this.logger.log(
          `Notification sent to hiring manager ${jobRequisition.hiringManagerId} for application ${applicationId} stage update`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send hiring manager notification for application ${applicationId}: ${error.message}`,
        );
      }
    }

    return {
      application: updatedApplication,
      progress,
      emailNotification,
    };
  }

  /**
   * Update application status (e.g., REJECTED, HIRED)
   * Business Rule (BR 9): Track application status changes
   * Business Rule (BR 11): Notify recruiters and hiring managers of status changes
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    rejectionReason?: string,
    notes?: string,
    changedBy?: string,
  ): Promise<{ application: ApplicationDocument, emailNotification: { email: string; name: string; subject: string; message: string } | null }> {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('requisitionId')
      .populate('candidateId')
      .populate('assignedHr');

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    const oldStatus = application.status;

    // Update the application status
    application.status = status;

    const updatedApplication = await application.save();

    // Create history record for the status change
    const historyRecord = new this.applicationHistoryModel({
      applicationId: new Types.ObjectId(applicationId),
      oldStatus,
      newStatus: status,
      changedBy: changedBy ? new Types.ObjectId(changedBy) : undefined,
      changedAt: new Date(),
      notes: notes || rejectionReason || `Status updated to ${status}`,
    });

    await historyRecord.save();

    // Prepare common notification data
    const jobRequisition = application.requisitionId as any;
    const candidate = application.candidateId as any;
    const jobTitle = jobRequisition?.templateId?.title || 'the position';
    const candidateName = candidate?.name || 'A candidate';

    // Send automated notification to candidate about status update
    try {
      const statusMessages: Record<ApplicationStatus, string> = {
        [ApplicationStatus.SUBMITTED]: `Your application for ${jobTitle} has been submitted successfully.`,
        [ApplicationStatus.IN_PROCESS]: `Your application for ${jobTitle} is now being processed.`,
        [ApplicationStatus.OFFER]: `Congratulations! You have received an offer for ${jobTitle}.`,
        [ApplicationStatus.HIRED]: `Congratulations! You have been hired for ${jobTitle}. Welcome aboard!`,
        [ApplicationStatus.REJECTED]: `Thank you for your interest in ${jobTitle}. Unfortunately, we have decided to move forward with other candidates.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      };

      let message = statusMessages[status] || `Your application status for ${jobTitle} has been updated to ${status}.`;
      if (notes && status !== ApplicationStatus.REJECTED) {
        message += ` Additional notes: ${notes}`;
      }

      await this.notificationService.emitForUser(
        candidate._id.toString(),
        `Application ${status === ApplicationStatus.HIRED ? 'Accepted' : status === ApplicationStatus.REJECTED ? 'Update' : 'Status Update'}`,
        message,
        { applicationId, status, jobTitle, rejectionReason },
      );

      this.logger.log(
        `Notification sent to candidate ${candidate._id} for application ${applicationId} status update to ${status}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send candidate notification for application ${applicationId}: ${error.message}`,
      );
    }

    // Prepare email notification data for frontend to send via EmailJS
    const candidateEmail = candidate?.personalEmail || candidate?.email;
    const statusEmailMessages: Record<ApplicationStatus, string> = {
      [ApplicationStatus.SUBMITTED]: `Thank you for applying for the ${jobTitle} position. Your application has been successfully submitted and is now under review. We will keep you informed of any updates.`,
      [ApplicationStatus.IN_PROCESS]: `Your application for the ${jobTitle} position is now being actively processed. Our team is reviewing your qualifications and you will hear from us soon.`,
      [ApplicationStatus.OFFER]: `Congratulations! We are pleased to inform you that you have received an offer for the ${jobTitle} position. Please check your email for further details about the offer.`,
      [ApplicationStatus.HIRED]: `Welcome aboard! We are thrilled to inform you that you have been officially hired for the ${jobTitle} position. Our HR team will be in touch with onboarding details shortly.`,
      [ApplicationStatus.REJECTED]: `Thank you for your interest in the ${jobTitle} position at our company. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.${rejectionReason ? ` Feedback: ${rejectionReason}` : ''} We appreciate the time you invested in applying and wish you the best in your future endeavors.`,
    };

    const statusEmailMessage = statusEmailMessages[status] || `Your application status for ${jobTitle} has been updated to ${status}.`;
    const emailSubject = status === ApplicationStatus.HIRED
      ? `Welcome to the Team - ${jobTitle}`
      : status === ApplicationStatus.REJECTED
        ? `Application Update - ${jobTitle}`
        : status === ApplicationStatus.OFFER
          ? `Job Offer - ${jobTitle}`
          : `Application Status Update - ${jobTitle}`;

    const emailNotification = candidateEmail ? {
      email: candidateEmail,
      name: candidateName,
      subject: emailSubject,
      message: statusEmailMessage,
    } : null;

    // REC-008 (BR 11): Notify assigned HR about candidate status change
    if (application.assignedHr) {
      try {
        const hrMessage = `Candidate ${candidateName}'s application for ${jobTitle} status changed from ${oldStatus} to ${status}.${notes || rejectionReason ? ` Notes: ${notes || rejectionReason}` : ''}`;

        await this.notificationService.emitForUser(
          (application.assignedHr as any)._id?.toString() || application.assignedHr.toString(),
          'Candidate Status Update',
          hrMessage,
          { applicationId, candidateName, status, jobTitle, oldStatus },
        );

        this.logger.log(
          `Notification sent to HR ${application.assignedHr} for application ${applicationId} status update`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send HR notification for application ${applicationId}: ${error.message}`,
        );
      }
    }

    // REC-008 (BR 11): Notify hiring manager about candidate status change
    if (jobRequisition?.hiringManagerId) {
      try {
        const hmMessage = `Candidate ${candidateName}'s application for ${jobTitle} has been ${status}.${notes || rejectionReason ? ` Notes: ${notes || rejectionReason}` : ''}`;

        await this.notificationService.emitForUser(
          jobRequisition.hiringManagerId._id?.toString() || jobRequisition.hiringManagerId.toString(),
          'Candidate Status Update',
          hmMessage,
          { applicationId, candidateName, status, jobTitle, oldStatus },
        );

        this.logger.log(
          `Notification sent to hiring manager ${jobRequisition.hiringManagerId} for application ${applicationId} status update`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send hiring manager notification for application ${applicationId}: ${error.message}`,
        );
      }
    }

    return { application: updatedApplication, emailNotification };
  }

  /**
   * Get application progress and current stage
   * Business Rule (BR 9): Track application through defined stages
   */
  async getApplicationProgress(applicationId: string): Promise<{
    currentStage: ApplicationStage;
    progress: number;
    stageHistory: ApplicationStatusHistoryDocument[];
  }> {
    const application = await this.applicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Calculate progress based on current stage
    const hiringStages = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    const stageIndex = hiringStages.indexOf(application.currentStage);
    const progress = stageIndex >= 0 ? ((stageIndex + 1) / hiringStages.length) * 100 : 0;

    // Get the stage history for this application
    const stageHistory = await this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .sort({ changedAt: 1 })
      .exec();

    return {
      currentStage: application.currentStage,
      progress,
      stageHistory,
    };
  }

  /**
   * Get all applications with their current stage and progress
   * Business Rule (BR 9): Track applications through defined stages
   * REC-030 (BR 14, BR 25): Include referral information
   */
  async getAllApplicationsWithProgress(): Promise<ApplicationDocument[]> {
    const applications = await this.applicationModel
      .find()
      .populate({
        path: 'requisitionId',
        populate: {
          path: 'templateId'
        }
      })
      .populate('candidateId')
      .populate('assignedHr')
      .exec();

    // Fetch all referrals for the candidates in these applications
    const candidateIds = applications.map(app => (app.candidateId as any)._id);
    const referrals = await this.referralModel.find({ candidateId: { $in: candidateIds } }).exec();
    const referralMap = new Map(referrals.map(ref => [ref.candidateId.toString(), ref]));

    // Attach referral information to each application
    const applicationsWithReferrals = applications.map(app => {
      const appObj = app.toObject();
      const candidateId = (app.candidateId as any)._id.toString();
      const referral = referralMap.get(candidateId);

      return {
        ...appObj,
        isReferral: !!referral,
        referralDetails: referral ? {
          referringEmployeeId: referral.referringEmployeeId,
          role: referral.role,
          level: referral.level
        } : null
      };
    });

    return applicationsWithReferrals as any;
  }

  /**
   * Get applications by stage
   * Business Rule (BR 9): Filter applications by their current stage
   */
  async getApplicationsByStage(stage: ApplicationStage): Promise<ApplicationDocument[]> {
    const hiringStages = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    if (!hiringStages.includes(stage)) {
      throw new BadRequestException(`Invalid stage: ${stage}. Must be one of: ${Object.values(ApplicationStage).join(', ')}`);
    }

    return await this.applicationModel
      .find({ currentStage: stage })
      .populate('jobRequisitionId')
      .populate('candidateId')
      .exec();
  }

  /**
   * Get application stage history
   * Business Rule (BR 9): View complete history of stage transitions
   */
  async getApplicationHistory(applicationId: string): Promise<ApplicationStatusHistoryDocument[]> {
    const application = await this.applicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    return await this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .populate('changedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * REC-023: Get all published job requisitions for the company careers page
   * Business Rule (BR 6): The system must allow automatic posting of approved requisitions
   * to internal and external career sites
   */
  async getPublishedJobRequisitions(): Promise<JobRequisitionDocument[]> {
    return await this.jobRequisitionModel
      .find({ publishStatus: 'published' })
      .populate('templateId')
      .sort({ postingDate: -1 })
      .exec();
  }

  /**
   * Submit a job application from the careers page
   * Creates a new candidate record and application
   * Stores resume URL (external link)
   */
  async submitCareerApplication(
    createCareerApplicationDto: CreateCareerApplicationDto,
  ) {
    const {
      firstName,
      middleName,
      lastName,
      nationalId,
      email,
      phone,
      dateOfBirth,
      gender,
      city,
      streetAddress,
      country,
      jobId,
      coverLetter,
      resumeUrl
    } = createCareerApplicationDto;

    try {
      // Verify the job requisition exists and is published
      const jobRequisition = await this.jobRequisitionModel
        .findById(jobId)
        .populate('templateId')
        .exec();

      if (!jobRequisition) {
        throw new NotFoundException('Job posting not found');
      }

      if (jobRequisition.publishStatus !== 'published') {
        throw new BadRequestException('This job posting is no longer accepting applications');
      }

      // Check if candidate already exists by email
      let candidate = await this.candidateModel.findOne({ personalEmail: email }).exec();

      if (!candidate) {
        // Generate a unique candidate number
        const candidateCount = await this.candidateModel.countDocuments().exec();
        const candidateNumber = `CAN-${String(candidateCount + 1).padStart(6, '0')}`;

        // Build full name
        const nameParts = [firstName, middleName, lastName].filter(Boolean);
        const fullName = nameParts.join(' ');

        // Create new candidate
        candidate = new this.candidateModel({
          candidateNumber,
          firstName,
          middleName,
          lastName,
          nationalId,
          personalEmail: email,
          mobilePhone: phone,
          fullName,
          applicationDate: new Date(),
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          address: (city || streetAddress || country) ? {
            city,
            streetAddress,
            country,
          } : undefined,
          resumeUrl: resumeUrl || undefined,
          notes: coverLetter || '',
        });

        try {
          await candidate.save();
          this.logger.log(`Created new candidate: ${candidate.candidateNumber} with email: ${candidate.personalEmail}`);
        } catch (error) {
          this.logger.error(`Failed to save candidate: ${error.message}`, error.stack);
          throw new BadRequestException(`Failed to create candidate profile: ${error.message}`);
        }
      } else {
        // Update existing candidate's resume and info if a new application is submitted
        if (resumeUrl) {
          candidate.resumeUrl = resumeUrl;
        }
        if (middleName) candidate.middleName = middleName;
        if (dateOfBirth) candidate.dateOfBirth = new Date(dateOfBirth);
        if (gender) candidate.gender = gender;
        if (city || streetAddress || country) {
          candidate.address = {
            city: city || candidate.address?.city,
            streetAddress: streetAddress || candidate.address?.streetAddress,
            country: country || candidate.address?.country,
          };
        }
        await candidate.save();
        this.logger.log(`Found existing candidate: ${candidate.candidateNumber}`);
      }

      // Check if candidate already applied for this job
      const existingApplication = await this.applicationModel
        .findOne({
          candidateId: candidate._id,
          requisitionId: new Types.ObjectId(jobId),
        })
        .exec();

      if (existingApplication) {
        throw new BadRequestException('You have already applied for this position');
      }

      // Create application
      const application = new this.applicationModel({
        candidateId: candidate._id,
        requisitionId: new Types.ObjectId(jobId),
        currentStage: ApplicationStage.SCREENING,
        status: ApplicationStatus.SUBMITTED,
      });

      await application.save();

      // Note: We skip creating application history for public submissions
      // since there's no authenticated user to reference in changedBy field.
      // The application's createdAt timestamp serves as the submission record.

      this.logger.log(
        `Application created for candidate ${candidate.candidateNumber} for job ${jobRequisition.requisitionId}`,
      );

      return {
        message: 'Application submitted successfully',
        applicationId: application._id,
        candidateId: candidate._id,
        candidateNumber: candidate.candidateNumber,
      };
    } catch (error) {
      this.logger.error(`Error submitting career application: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Apply for a job as an authenticated candidate
   * Uses existing candidate profile from JWT token
   */
  async applyAsAuthenticatedCandidate(jobId: string, user: any) {
    try {
      this.logger.log(`applyAsAuthenticatedCandidate - user from JWT: ${JSON.stringify(user)}`);

      // Ensure user is a candidate (check userType or empty roles like MenuBar does)
      const isCandidate = user?.userType === 'candidate' ||
        (Array.isArray(user?.roles) && user.roles.length === 0);

      if (!isCandidate) {
        throw new BadRequestException(
          'This endpoint is only available for candidate accounts',
        );
      }

      // Get candidate by ID from JWT
      const candidate = await this.candidateModel
        .findById(user.id)
        .exec();

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // Verify the job requisition exists and is published
      const jobRequisition = await this.jobRequisitionModel
        .findById(jobId)
        .populate('templateId')
        .exec();

      if (!jobRequisition) {
        throw new NotFoundException('Job posting not found');
      }

      if (jobRequisition.publishStatus !== 'published') {
        throw new BadRequestException(
          'This job posting is no longer accepting applications',
        );
      }

      // Check if candidate already applied for this job
      const existingApplication = await this.applicationModel
        .findOne({
          candidateId: candidate._id,
          requisitionId: new Types.ObjectId(jobId),
        })
        .exec();

      if (existingApplication) {
        throw new BadRequestException(
          'You have already applied for this position',
        );
      }

      // Create application
      const application = new this.applicationModel({
        candidateId: candidate._id,
        requisitionId: new Types.ObjectId(jobId),
        currentStage: ApplicationStage.SCREENING,
        status: ApplicationStatus.SUBMITTED,
      });

      await application.save();

      this.logger.log(
        `Application created for authenticated candidate ${candidate.candidateNumber} for job ${jobRequisition.requisitionId}`,
      );

      return {
        message: 'Application submitted successfully',
        applicationId: application._id,
        candidateId: candidate._id,
        candidateNumber: candidate.candidateNumber,
      };
    } catch (error) {
      this.logger.error(
        `Error submitting application for authenticated candidate: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all applications for the authenticated candidate
   */
  async getMyApplications(user: any) {
    try {
      // Get candidate by ID from JWT
      const candidate = await this.candidateModel
        .findById(user.id)
        .exec();

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // Get all applications for this candidate
      const applications = await this.applicationModel
        .find({ candidateId: candidate._id })
        .populate({
          path: 'requisitionId',
          populate: {
            path: 'templateId',
          },
        })
        .sort({ createdAt: -1 })
        .exec();

      return applications.map((app: any) => ({
        _id: app._id,
        jobRequisitionId: app.requisitionId?._id,
        jobTitle: app.requisitionId?.templateId?.title,
        department: app.requisitionId?.templateId?.department,
        location: app.requisitionId?.location,
        currentStage: app.currentStage,
        status: app.status,
        appliedAt: app.createdAt,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching applications for candidate: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * REC-023: Preview a job requisition formatted for the careers page with employer-brand content
   * Business Rule (BR 6): Allow preview before posting to ensure openings look professional
   */
  async previewJobRequisitionForCareers(id: string): Promise<{
    requisition: JobRequisitionDocument;
    formattedForCareers: {
      title: string;
      department: string;
      location: string;
      openings: number;
      qualifications: string[];
      skills: string[];
      postingDate: Date | null;
      expiryDate: Date;
      status: string;
    };
  }> {
    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .exec();

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${id} not found`);
    }

    // Format the requisition for careers page preview
    // Department, title, qualifications, and skills come from the template
    const templateData = requisition.templateId as any;

    const formattedForCareers = {
      title: templateData?.title || 'Job Opening',
      department: templateData?.department || 'Department',
      location: requisition.location,
      openings: requisition.openings,
      qualifications: templateData?.qualifications || [],
      skills: templateData?.skills || [],
      postingDate: requisition.postingDate || null,
      expiryDate: requisition.expiryDate || new Date(),
      status: requisition.publishStatus,
    };

    return {
      requisition,
      formattedForCareers,
    };
  }

  /**
   * REC-007: Submit a job application with CV/resume upload
   * REC-028: Capture GDPR consent for data processing and background checks
   * Business Rule (BR 12): The system must support the storage/upload of applications with resumes,
   * which creates the organization's talent pool
   * Business Rule (BR 27, BR 36): Send automated confirmation to candidates upon submission
   * Business Rule (BR 28, NFR-33): GDPR compliance - store consent and compliance data
   */
  async submitApplication(
    jobRequisitionId: string,
    candidateId: string,
    resumeUrl: string,
    coverLetter?: string,
    consentData?: {
      consentGiven: boolean;
      consentDataProcessing?: boolean;
      consentBackgroundCheck?: boolean;
      consentIpAddress?: string;
      consentTimestamp?: Date;
    },
  ): Promise<ApplicationDocument> {
    // REC-028: Validate GDPR consent (BR 28, NFR-33)
    if (!consentData || !consentData.consentGiven) {
      throw new BadRequestException(
        'Candidate consent is required for data processing as per GDPR and privacy laws. Please provide consent to proceed with the application.'
      );
    }
    // Validate that the job requisition exists and is published
    const requisition = await this.jobRequisitionModel
      .findById(jobRequisitionId)
      .populate('templateId');

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${jobRequisitionId} not found`);
    }

    if (requisition.publishStatus !== 'published') {
      throw new BadRequestException(`Job requisition ${jobRequisitionId} is not accepting applications`);
    }

    // Check if application already exists for this candidate and job
    const existingApplication = await this.applicationModel.findOne({
      jobRequisitionId: new Types.ObjectId(jobRequisitionId),
      candidateId: new Types.ObjectId(candidateId),
    });

    if (existingApplication) {
      throw new BadRequestException(`Application already exists for this job and candidate`);
    }

    // Create the application with CV/resume and GDPR consent data (REC-028)
    const application = new this.applicationModel({
      jobRequisitionId: new Types.ObjectId(jobRequisitionId),
      candidateId: new Types.ObjectId(candidateId),
      resumeUrl,
      coverLetter: coverLetter || '',
      currentStage: ApplicationStage.SCREENING,
      applicationDate: new Date(),
      // GDPR Consent Fields (REC-028, BR 28, NFR-33)
      consentGiven: consentData.consentGiven,
      consentDataProcessing: consentData.consentDataProcessing ?? true,
      consentBackgroundCheck: consentData.consentBackgroundCheck ?? false,
      consentIpAddress: consentData.consentIpAddress || 'unknown',
      consentTimestamp: consentData.consentTimestamp || new Date(),
    } as any); // Using 'as any' because schema doesn't explicitly define these fields, but Mongoose will store them

    const savedApplication = await application.save();

    // Create initial stage history record
    const historyRecord = new this.applicationHistoryModel({
      applicationId: savedApplication._id,
      newStage: ApplicationStage.SCREENING,
      changedBy: new Types.ObjectId(candidateId),
    });

    await historyRecord.save();

    // Send automated confirmation notification to candidate
    try {
      const templateData = requisition.templateId as any;
      const jobTitle = templateData?.title || 'the position';
      const message = `Your application for ${jobTitle} has been successfully submitted. You will receive updates as your application progresses through our hiring process.`;

      await this.notificationService.emitForUser(
        candidateId,
        'Application Submitted',
        message,
        { applicationId: savedApplication._id.toString(), jobTitle },
      );

      this.logger.log(
        `Application submission confirmation sent to candidate ${candidateId} for application ${savedApplication._id}`,
      );
    } catch (error) {
      // Log error but don't fail the application submission
      this.logger.error(
        `Failed to send application confirmation for application ${savedApplication._id}: ${error.message}`,
      );
    }

    // Return populated application
    const populatedApplication = await this.applicationModel
      .findById(savedApplication._id)
      .populate('jobRequisitionId')
      .populate('candidateId')
      .exec();

    if (!populatedApplication) {
      throw new NotFoundException(`Application with ID ${savedApplication._id} not found after save`);
    }

    return populatedApplication;
  }

  /**
   * REC-007: Get all applications in the talent pool
   * Business Rule (BR 12): Support storage/upload of applications with resumes to create talent pool
   */
  async getTalentPool(): Promise<ApplicationDocument[]> {
    return await this.applicationModel
      .find()
      .populate('jobRequisitionId')
      .populate('candidateId')
      .sort({ applicationDate: -1 })
      .exec();
  }

  /**
   * REC-007: Search and filter the talent pool by various criteria
   * Business Rule (BR 12): Enable searching the organization's talent pool
   */
  async searchTalentPool(filters: {
    jobRequisitionId?: string;
    currentStage?: ApplicationStage;
    candidateName?: string;
    applicationDateFrom?: Date;
    applicationDateTo?: Date;
  }): Promise<ApplicationDocument[]> {
    const query: any = {};

    if (filters.jobRequisitionId) {
      query.jobRequisitionId = new Types.ObjectId(filters.jobRequisitionId);
    }

    if (filters.currentStage) {
      // Validate the stage
      const validStages = [
        ApplicationStage.SCREENING,
        ApplicationStage.DEPARTMENT_INTERVIEW,
        ApplicationStage.HR_INTERVIEW,
        ApplicationStage.OFFER,
      ];

      if (!validStages.includes(filters.currentStage)) {
        throw new BadRequestException(`Invalid stage: ${filters.currentStage}`);
      }

      query.currentStage = filters.currentStage;
    }

    if (filters.applicationDateFrom || filters.applicationDateTo) {
      query.applicationDate = {};

      if (filters.applicationDateFrom) {
        query.applicationDate.$gte = filters.applicationDateFrom;
      }

      if (filters.applicationDateTo) {
        query.applicationDate.$lte = filters.applicationDateTo;
      }
    }

    const applications = await this.applicationModel
      .find(query)
      .populate('jobRequisitionId')
      .populate('candidateId')
      .sort({ applicationDate: -1 })
      .exec();

    // Filter by candidate name if provided (post-query filtering since candidate is in a separate collection)
    if (filters.candidateName && applications.length > 0) {
      const searchTerm = filters.candidateName.toLowerCase();
      return applications.filter((app) => {
        const candidate = app.candidateId as any;
        if (candidate && candidate.name) {
          return candidate.name.toLowerCase().includes(searchTerm);
        }
        return false;
      });
    }

    return applications;
  }

  /**
   * REC-007: Get a specific application by ID with full details
   * Business Rule (BR 12): View application details including resume
   */
  async getApplicationById(applicationId: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate({
        path: 'requisitionId',
        populate: {
          path: 'templateId'
        }
      })
      .populate('candidateId')
      .populate('assignedHr')
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    return application;
  }

  /**
   * REC-007: Get all applications for a specific candidate
   * Business Rule (BR 12): View all applications submitted by a candidate
   */
  async getApplicationsByCandidate(candidateId: string): Promise<ApplicationDocument[]> {
    return await this.applicationModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .populate('jobRequisitionId')
      .sort({ applicationDate: -1 })
      .exec();
  }

  /**
   * REC-007: Get all applications for a specific job requisition
   * Business Rule (BR 12): View all applications for a job opening
   */
  /**
   * REC-030: Tag a candidate as a referral
   * Business Rule (BR 14, BR 25): Tag candidates as referrals for higher priority
   */
  async tagCandidateAsReferral(candidateId: string, createReferralDto: CreateReferralDto): Promise<ReferralDocument> {
    const referral = new this.referralModel({
      candidateId: new Types.ObjectId(candidateId),
      referringEmployeeId: new Types.ObjectId(createReferralDto.referringEmployeeId),
      role: createReferralDto.role,
      level: createReferralDto.level,
    });

    return await referral.save();
  }

  /**
   * REC-007: Get all applications for a specific job requisition
   * Business Rule (BR 12): View all applications for a job opening
   * REC-030 (BR 14, BR 25): Prioritize referrals in the list
   */
  async getApplicationsByJobRequisition(jobRequisitionId: string): Promise<ApplicationDocument[]> {
    const requisition = await this.jobRequisitionModel.findById(jobRequisitionId);

    if (!requisition) {
      throw new NotFoundException(`Job requisition with ID ${jobRequisitionId} not found`);
    }

    const applications = await this.applicationModel
      .find({ jobRequisitionId: new Types.ObjectId(jobRequisitionId) })
      .populate('candidateId')
      .sort({ applicationDate: -1 })
      .exec();

    // Fetch all referrals for the candidates in these applications
    const candidateIds = applications.map(app => app.candidateId._id);
    const referrals = await this.referralModel.find({ candidateId: { $in: candidateIds } }).exec();
    const referralCandidateIds = new Set(referrals.map(ref => ref.candidateId.toString()));

    // Sort applications: Referrals first, then by date (already sorted by date from DB, so stable sort needed or just re-sort)
    // Since we want referrals at the top, we can use a custom sort function
    return applications.sort((a, b) => {
      const aIsReferral = referralCandidateIds.has((a.candidateId as any)._id.toString());
      const bIsReferral = referralCandidateIds.has((b.candidateId as any)._id.toString());

      if (aIsReferral && !bIsReferral) return -1;
      if (!aIsReferral && bIsReferral) return 1;
      return 0; // Keep original order (date) if both are referrals or both are not
    });
  }

  /**
   * REC-017: Get candidate's own applications with status and progress
   * Business Rule (BR 27, BR 36): Candidate Status Tracking must be easily visualized and up-to-date
   * For Candidate Self-Service Portal
   */
  async getCandidateApplicationsWithStatus(candidateId: string): Promise<
    Array<{
      application: ApplicationDocument;
      progress: number;
      currentStage: ApplicationStage;
      recentHistory: ApplicationStatusHistoryDocument[];
    }>
  > {
    const applications = await this.applicationModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .populate('jobRequisitionId')
      .sort({ applicationDate: -1 })
      .exec();

    // For each application, get progress and recent history
    const applicationsWithStatus = await Promise.all(
      applications.map(async (application) => {
        const hiringStages = [
          ApplicationStage.SCREENING,
          ApplicationStage.DEPARTMENT_INTERVIEW,
          ApplicationStage.HR_INTERVIEW,
          ApplicationStage.OFFER,
        ];

        const stageIndex = hiringStages.indexOf(application.currentStage);
        const progress = stageIndex >= 0 ? ((stageIndex + 1) / hiringStages.length) * 100 : 0;

        // Get recent history (last 5 updates)
        const recentHistory = await this.applicationHistoryModel
          .find({ applicationId: application._id })
          .sort({ changedAt: -1 })
          .limit(5)
          .exec();

        return {
          application,
          progress,
          currentStage: application.currentStage,
          recentHistory,
        };
      }),
    );

    return applicationsWithStatus;
  }

  /**
   * REC-017: Get candidate's notifications about their applications
   * Business Rule (BR 27, BR 36): System must send automated alerts/emails to candidates
   * For Candidate Self-Service Portal
   */
  async getCandidateNotifications(candidateId: string) {
    return await this.notificationService.findAll();
  }

  /**
   * REC-017: Get detailed status for a specific candidate's application
   * Business Rule (BR 27, BR 36): Candidate Status Tracking must be easily visualized
   * For Candidate Self-Service Portal
   */
  async getCandidateApplicationStatus(
    candidateId: string,
    applicationId: string,
  ): Promise<{
    application: ApplicationDocument;
    progress: number;
    currentStage: ApplicationStage;
    stageHistory: ApplicationStatusHistoryDocument[];
    notifications: any[];
  }> {
    const application = await this.applicationModel
      .findOne({
        _id: new Types.ObjectId(applicationId),
        candidateId: new Types.ObjectId(candidateId),
      })
      .populate('jobRequisitionId')
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found for candidate ${candidateId}`,
      );
    }

    // Calculate progress
    const hiringStages = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    const stageIndex = hiringStages.indexOf(application.currentStage);
    const progress = stageIndex >= 0 ? ((stageIndex + 1) / hiringStages.length) * 100 : 0;

    // Get complete stage history
    const stageHistory = await this.applicationHistoryModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .sort({ changedAt: 1 })
      .exec();

    // Get related notifications
    const notifications = await this.notificationService.findAll();

    return {
      application,
      progress,
      currentStage: application.currentStage,
      stageHistory,
      notifications,
    };
  }

  /**
   * REC-010: Schedule an interview for an application
   * Business Rule (BR 19a): Recruiters must be able to schedule interviews by selecting time slots, panel members, and modes
   * Business Rule (BR 19c): Interviewers must receive automatic calendar invites
   * Business Rule (BR 19d): Candidates must be notified automatically
   */
  async scheduleInterview(scheduleInterviewDto: ScheduleInterviewDto): Promise<InterviewDocument> {
    const { applicationId, stage, scheduledDate, method, panel, videoLink, candidateFeedback } = scheduleInterviewDto;

    // Validate application exists and get candidate/job info
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('candidateId')
      .populate({
        path: 'requisitionId',
        populate: { path: 'templateId' },
      })
      .exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Debug logging for panel member IDs
    this.logger.debug('Scheduling interview with panel members:', {
      applicationId,
      panelIds: panel.map(p => p.toString()),
      panelCount: panel.length,
    });

    // Verify panel members exist in database
    const panelObjectIds = panel.map(p => new Types.ObjectId(p.toString()));
    for (const panelMemberId of panelObjectIds) {
      const employeeExists = await this.employeeProfileModel.findById(panelMemberId);
      if (!employeeExists) {
        this.logger.warn(`Panel member with ID ${panelMemberId} not found in EmployeeProfile collection`);
      } else {
        this.logger.debug(`Panel member found: ${employeeExists.firstName} ${employeeExists.lastName} (${panelMemberId})`);
      }
    }

    // Create the interview record
    const interview = new this.interviewModel({
      applicationId: new Types.ObjectId(applicationId.toString()),
      stage,
      scheduledDate,
      method,
      panel: panelObjectIds,
      videoLink,
      candidateFeedback,
      status: InterviewStatus.SCHEDULED,
    });

    const savedInterview = await interview.save();
    this.logger.debug(`Interview saved with ID: ${savedInterview._id}, panel: ${savedInterview.panel}`);

    // Get job and candidate details for notifications
    const candidate = application.candidateId as any;
    const jobRequisition = application.requisitionId as any;
    const jobTitle = jobRequisition?.templateId?.title || 'the position';
    const candidateName = candidate?.name || 'Candidate';

    // BR 19c: Send automatic calendar invites to panel members (interviewers)
    try {
      for (const panelMemberId of panel) {
        // Check if panel member is on leave
        const leaveStatus = await this.requestsService.isEmployeeOnLeaveOnDate(
          panelMemberId.toString(),
          scheduledDate,
          true // Include pending requests
        );

        if (leaveStatus.isOnLeave) {
          throw new BadRequestException(
            `Panel member ${panelMemberId} is on leave on ${scheduledDate.toDateString()}`
          );
        }

        // Check if panel member has another interview at the same time
        // Assuming 1 hour duration for now, or we could add duration to DTO
        const interviewDurationMs = 60 * 60 * 1000; // 1 hour
        const proposedEndTime = new Date(scheduledDate.getTime() + interviewDurationMs);

        const existingInterview = await this.interviewModel.findOne({
          panel: new Types.ObjectId(panelMemberId.toString()),
          status: { $ne: InterviewStatus.CANCELLED },
          scheduledDate: {
            $lt: proposedEndTime,
            $gt: new Date(scheduledDate.getTime() - interviewDurationMs)
          }
        });

        if (existingInterview) {
          throw new BadRequestException(
            `Panel member ${panelMemberId} has another interview scheduled around this time`
          );
        }

        const interviewMethodText = method === InterviewMethod.VIDEO ? 'video call' :
          method === InterviewMethod.PHONE ? 'phone call' :
            'on-site interview';

        let message = `You have been assigned to conduct a ${interviewMethodText} for ${candidateName} applying for ${jobTitle} on ${scheduledDate.toLocaleString()}.`;

        if (method === InterviewMethod.VIDEO && videoLink) {
          message += ` Video link: ${videoLink}`;
        }

        await this.notificationService.emitForUser(
          panelMemberId.toString(),
          'Interview Scheduled - Calendar Invite',
          message,
          {
            interviewId: savedInterview._id.toString(),
            applicationId: applicationId.toString(),
            candidateName,
            jobTitle,
            scheduledDate,
            method,
            videoLink,
          },
        );

        this.logger.log(
          `Calendar invite sent to panel member ${panelMemberId} for interview ${savedInterview._id}`,
        );
      }
    } catch (error) {
      // If it's our validation error, rethrow it
      if (error instanceof BadRequestException) {
        // We should probably rollback the saved interview if validation fails
        await this.interviewModel.findByIdAndDelete(savedInterview._id);
        throw error;
      }

      this.logger.error(
        `Failed to send calendar invites to panel members for interview ${savedInterview._id}: ${error.message}`,
      );
    }

    // BR 19d: Send automatic notification to candidate
    try {
      const interviewMethodText = method === InterviewMethod.VIDEO ? 'video interview' :
        method === InterviewMethod.PHONE ? 'phone interview' :
          'on-site interview';

      let candidateMessage = `Your interview for ${jobTitle} has been scheduled as a ${interviewMethodText} on ${scheduledDate.toLocaleString()}.`;

      if (method === InterviewMethod.VIDEO && videoLink) {
        candidateMessage += ` You will receive the video link: ${videoLink}`;
      } else if (method === InterviewMethod.ONSITE) {
        candidateMessage += ` Please arrive on time at the specified location.`;
      }

      if (candidateFeedback) {
        candidateMessage += ` Note: ${candidateFeedback}`;
      }

      await this.notificationService.emitForUser(
        candidate._id.toString(),
        'Interview Scheduled',
        candidateMessage,
        {
          interviewId: savedInterview._id.toString(),
          applicationId: applicationId.toString(),
          jobTitle,
          scheduledDate,
          method,
          videoLink,
        },
      );

      this.logger.log(
        `Interview notification sent to candidate ${candidate._id} for interview ${savedInterview._id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send interview notification to candidate for interview ${savedInterview._id}: ${error.message}`,
      );
    }

    // Return populated interview
    const populatedInterview = await this.interviewModel
      .findById(savedInterview._id)
      .populate('applicationId')
      .exec();

    if (!populatedInterview) {
      throw new NotFoundException(`Interview with ID ${savedInterview._id} not found after save`);
    }

    // Manually populate panel members
    const fullyPopulatedInterview = await this.populateSingleInterviewPanel(populatedInterview);

    this.logger.debug(`Returning populated interview ${fullyPopulatedInterview._id}`);

    return fullyPopulatedInterview;
  }

  /**
   * REC-010: Get all interviews for a specific application
   */
  async getInterviewsByApplication(applicationId: string): Promise<InterviewDocument[]> {
    const application = await this.applicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Get interviews and populate application data
    const interviews = await this.interviewModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'requisitionId', populate: { path: 'templateId' } }
        ]
      })
      .sort({ scheduledDate: -1 })
      .exec();

    // Manually populate panel members to ensure they are always resolved
    const populatedInterviews = await this.populatePanelMembers(interviews);

    this.logger.debug(`Found ${populatedInterviews.length} interviews for application ${applicationId}`);

    return populatedInterviews;
  }

  /**
   * REC-010: Get all interviews across all applications
   * For interview list/management page
   */
  async getAllInterviews(): Promise<InterviewDocument[]> {
    const interviews = await this.interviewModel
      .find()
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'requisitionId', populate: { path: 'templateId' } }
        ]
      })
      .sort({ scheduledDate: -1 })
      .exec();

    // Manually populate panel members to ensure they are always resolved
    const populatedInterviews = await this.populatePanelMembers(interviews);

    // Debug logging for panel members
    interviews.forEach((interview, index) => {
      this.logger.debug(`Interview ${index}: ID=${interview._id}`);
      this.logger.debug(`  Panel array length: ${interview.panel?.length || 0}`);
      interview.panel?.forEach((member: any, memberIndex) => {
        this.logger.debug(`  Panel member ${memberIndex}:`, {
          _id: member._id,
          isObjectId: member._id instanceof Types.ObjectId,
          firstName: member.firstName,
          lastName: member.lastName,
          workEmail: member.workEmail,
          employeeNumber: member.employeeNumber,
          rawType: typeof member,
        });
      });
    });

    return populatedInterviews;
  }

  /**
   * REC-010: Update an existing interview
   * Re-notifies participants if schedule changes
   */
  async updateInterview(
    interviewId: string,
    updateData: Partial<ScheduleInterviewDto>,
  ): Promise<InterviewDocument> {
    const interview = await this.interviewModel
      .findById(interviewId)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'requisitionId', populate: { path: 'templateId' } },
        ],
      })
      .exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const scheduleChanged = updateData.scheduledDate &&
      updateData.scheduledDate.getTime() !== interview.scheduledDate.getTime();

    // Update interview fields
    if (updateData.scheduledDate) interview.scheduledDate = updateData.scheduledDate;
    if (updateData.method) interview.method = updateData.method;
    if (updateData.panel) interview.panel = updateData.panel.map(p => new Types.ObjectId(p.toString()));
    if (updateData.videoLink !== undefined) interview.videoLink = updateData.videoLink;
    if (updateData.candidateFeedback !== undefined) interview.candidateFeedback = updateData.candidateFeedback;

    const updatedInterview = await interview.save();

    // Re-notify if schedule changed
    if (scheduleChanged) {
      const newDate = updateData.scheduledDate!;

      // Check availability for all panel members (existing + new if panel changed)
      // For simplicity, we check the current panel on the interview object (which has been updated above)
      for (const panelMemberId of interview.panel) {
        // Check if panel member is on leave
        const leaveStatus = await this.requestsService.isEmployeeOnLeaveOnDate(
          panelMemberId.toString(),
          newDate,
          true // Include pending requests
        );

        if (leaveStatus.isOnLeave) {
          throw new BadRequestException(
            `Panel member ${panelMemberId} is on leave on ${newDate.toDateString()}`
          );
        }

        // Check for other interviews
        const interviewDurationMs = 60 * 60 * 1000; // 1 hour
        const proposedEndTime = new Date(newDate.getTime() + interviewDurationMs);

        const existingInterview = await this.interviewModel.findOne({
          _id: { $ne: interview._id }, // Exclude current interview
          panel: new Types.ObjectId(panelMemberId.toString()),
          status: { $ne: InterviewStatus.CANCELLED },
          scheduledDate: {
            $lt: proposedEndTime,
            $gt: new Date(newDate.getTime() - interviewDurationMs)
          }
        });

        if (existingInterview) {
          throw new BadRequestException(
            `Panel member ${panelMemberId} has another interview scheduled around this time`
          );
        }
      }

      const application = interview.applicationId as any;
      const candidate = application.candidateId;
      const jobRequisition = application.requisitionId;
      const jobTitle = jobRequisition?.templateId?.title || 'the position';
      const candidateName = candidate?.name || 'Candidate';

      // Notify panel members
      try {
        for (const panelMemberId of interview.panel) {
          await this.notificationService.emitForUser(
            panelMemberId.toString(),
            'Interview Rescheduled',
            `The interview for ${candidateName} applying for ${jobTitle} has been rescheduled to ${interview.scheduledDate.toLocaleString()}.`,
            { interviewId, applicationId: application._id.toString(), scheduledDate: interview.scheduledDate },
          );
        }
      } catch (error) {
        this.logger.error(`Failed to notify panel members about interview update: ${error.message}`);
      }

      // Notify candidate
      try {
        await this.notificationService.emitForUser(
          candidate._id.toString(),
          'Interview Rescheduled',
          `Your interview for ${jobTitle} has been rescheduled to ${interview.scheduledDate.toLocaleString()}.`,
          { interviewId, applicationId: application._id.toString(), scheduledDate: interview.scheduledDate },
        );
      } catch (error) {
        this.logger.error(`Failed to notify candidate about interview update: ${error.message}`);
      }
    }

    // Return populated interview
    const populatedInterview = await this.interviewModel
      .findById(updatedInterview._id)
      .populate('applicationId')
      .exec();

    if (!populatedInterview) {
      throw new NotFoundException(`Interview with ID ${updatedInterview._id} not found after update`);
    }

    // Manually populate panel members
    const fullyPopulatedInterview = await this.populateSingleInterviewPanel(populatedInterview);

    return fullyPopulatedInterview;
  }

  /**
   * REC-010: Cancel an interview
   * Notifies all participants about the cancellation
   */
  async cancelInterview(interviewId: string): Promise<InterviewDocument> {
    const interview = await this.interviewModel
      .findById(interviewId)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'requisitionId', populate: { path: 'templateId' } },
        ],
      })
      .exec();

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Update status to cancelled
    interview.status = InterviewStatus.CANCELLED;
    const updatedInterview = await interview.save();

    const application = interview.applicationId as any;
    const candidate = application.candidateId;
    const jobRequisition = application.requisitionId;
    const jobTitle = jobRequisition?.templateId?.title || 'the position';
    const candidateName = candidate?.name || 'Candidate';

    // Notify panel members
    try {
      for (const panelMemberId of interview.panel) {
        await this.notificationService.emitForUser(
          panelMemberId.toString(),
          'Interview Cancelled',
          `The interview for ${candidateName} applying for ${jobTitle} scheduled on ${interview.scheduledDate.toLocaleString()} has been cancelled.`,
          { interviewId, applicationId: application._id.toString() },
        );
      }
      this.logger.log(`Cancellation notifications sent to panel members for interview ${interviewId}`);
    } catch (error) {
      this.logger.error(`Failed to notify panel members about interview cancellation: ${error.message}`);
    }

    // Notify candidate
    try {
      await this.notificationService.emitForUser(
        candidate._id.toString(),
        'Interview Cancelled',
        `We regret to inform you that your interview for ${jobTitle} scheduled on ${interview.scheduledDate.toLocaleString()} has been cancelled. We will contact you to reschedule.`,
        { interviewId, applicationId: application._id.toString() },
      );
      this.logger.log(`Cancellation notification sent to candidate for interview ${interviewId}`);
    } catch (error) {
      this.logger.error(`Failed to notify candidate about interview cancellation: ${error.message}`);
    }

    return updatedInterview;
  }

  /**
   * REC-011: Submit feedback and score for an interview
   * Business Rule (BR 10, BR 22): The system must allow adding comments and ratings at each stage.
   * Feedback at each stage must be submitted by the panel/interviewers to ensure accuracy.
   */
  async submitInterviewFeedback(submitFeedbackDto: any): Promise<AssessmentResultDocument> {
    const { interviewId, interviewerId, score, comments } = submitFeedbackDto;

    // Validate interview exists
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Validate interviewer is part of the panel
    const isPanelMember = interview.panel.some(
      (id) => id.toString() === interviewerId.toString(),
    );

    if (!isPanelMember) {
      throw new BadRequestException(
        `User ${interviewerId} is not a panel member for this interview`,
      );
    }

    // Check if feedback already exists for this interviewer
    const existingFeedback = await this.assessmentResultModel.findOne({
      interviewId: new Types.ObjectId(interviewId),
      interviewerId: new Types.ObjectId(interviewerId),
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.score = score;
      existingFeedback.comments = comments;
      return await existingFeedback.save();
    }

    // Create new assessment result
    const assessmentResult = new this.assessmentResultModel({
      interviewId: new Types.ObjectId(interviewId),
      interviewerId: new Types.ObjectId(interviewerId),
      score,
      comments,
    });

    const savedResult = await assessmentResult.save();

    // Notify HR about feedback submission
    const application = await this.applicationModel
      .findById(interview.applicationId)
      .populate('assignedHr')
      .populate('candidateId')
      .populate({
        path: 'requisitionId',
        populate: { path: 'templateId' },
      });

    if (application && application.assignedHr) {
      const candidate = application.candidateId as any;
      const jobRequisition = application.requisitionId as any;
      const jobTitle = jobRequisition?.templateId?.title || 'the position';
      const candidateName = candidate?.name || 'Candidate';

      try {
        await this.notificationService.emitForUser(
          (application.assignedHr as any)._id?.toString() || application.assignedHr.toString(),
          'Interview Feedback Submitted',
          `Feedback submitted for ${candidateName} (${jobTitle}) by interviewer. Score: ${score}/100`,
          {
            interviewId,
            applicationId: application._id.toString(),
            interviewerId,
            score,
          },
        );
      } catch (error) {
        this.logger.error(
          `Failed to notify HR about feedback submission: ${error.message}`,
        );
      }
    }

    return savedResult;
  }

  /**
   * REC-011: Get all feedback for a specific interview
   */
  async getInterviewFeedback(interviewId: string): Promise<AssessmentResultDocument[]> {
    return await this.assessmentResultModel
      .find({ interviewId: new Types.ObjectId(interviewId) })
      .populate('interviewerId', 'firstName lastName email')
      .exec();
  }

  /**
   * REC-011: Get aggregated score and statistics for an interview
   */
  async getAggregatedInterviewScore(interviewId: string): Promise<{
    averageScore: number;
    totalFeedbacks: number;
    panelSize: number;
    submissionStatus: {
      submitted: number;
      pending: number;
    };
    results: AssessmentResultDocument[];
  }> {
    const interview = await this.interviewModel.findById(interviewId);
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const results = await this.assessmentResultModel
      .find({ interviewId: new Types.ObjectId(interviewId) })
      .populate('interviewerId', 'firstName lastName email')
      .exec();

    const totalFeedbacks = results.length;
    const panelSize = interview.panel.length;

    let averageScore = 0;
    if (totalFeedbacks > 0) {
      const sum = results.reduce((acc, curr) => acc + curr.score, 0);
      averageScore = sum / totalFeedbacks;
    }

    return {
      averageScore,
      totalFeedbacks,
      panelSize,
      submissionStatus: {
        submitted: totalFeedbacks,
        pending: panelSize - totalFeedbacks,
      },
      results,
    };
  }

  /**
   * REC-011: Get interviews pending feedback for a specific interviewer
   */
  async getInterviewerPendingFeedback(interviewerId: string): Promise<InterviewDocument[]> {
    this.logger.debug(`Getting pending feedback for interviewer: ${interviewerId}`);

    // Find all interviews where user is a panel member
    const interviews = await this.interviewModel
      .find({
        panel: new Types.ObjectId(interviewerId),
        status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.COMPLETED] },
      })
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'candidateId' },
          { path: 'requisitionId', populate: { path: 'templateId' } },
        ],
      })
      .sort({ scheduledDate: -1 })
      .exec();

    // Manually populate panel members
    const populatedInterviews = await this.populatePanelMembers(interviews);

    this.logger.debug(`Found ${populatedInterviews.length} interviews for interviewer ${interviewerId}`);

    // Filter out interviews where feedback is already submitted
    const pendingInterviews: InterviewDocument[] = [];

    for (const interview of populatedInterviews) {
      const feedback = await this.assessmentResultModel.findOne({
        interviewId: interview._id,
        interviewerId: new Types.ObjectId(interviewerId),
      });

      if (!feedback) {
        pendingInterviews.push(interview);
      }
    }

    this.logger.debug(`Returning ${pendingInterviews.length} pending interviews`);
    return pendingInterviews;
  }

  /**
   * REC-010: Get panel member availability for interview scheduling
   * Returns busy periods (leaves and existing interviews) for visual calendar display
   */
  async getPanelMemberAvailability(
    panelMemberIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const availability: any[] = [];

    for (const memberId of panelMemberIds) {
      // Get panel member details from EmployeeProfile model
      const member = await this.employeeProfileModel.findById(memberId).select('firstName lastName workEmail employeeNumber').lean();

      if (!member) {
        continue;
      }

      // Get leave requests (approved and pending)
      const leaveRequests = await this.requestsService.getEmployeeLeaveRequestsInRange(
        memberId,
        startDate,
        endDate,
      );

      // Get scheduled interviews
      const interviews = await this.interviewModel
        .find({
          panel: new Types.ObjectId(memberId),
          status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.COMPLETED] },
          scheduledDate: { $gte: startDate, $lte: endDate },
        })
        .populate({
          path: 'applicationId',
          populate: [
            { path: 'candidateId' },
            { path: 'requisitionId', populate: { path: 'templateId' } },
          ],
        })
        .sort({ scheduledDate: 1 })
        .exec();

      // Format busy periods
      const busyPeriods = [
        // Leave periods
        ...leaveRequests.map((leave: any) => ({
          type: 'leave',
          status: leave.status,
          startDate: leave.dates?.from || leave.fromDate,
          endDate: leave.dates?.to || leave.toDate,
          reason: leave.leaveTypeId?.name || 'Leave',
          allDay: true,
        })),
        // Interview slots (1 hour duration)
        ...interviews.map((interview: any) => {
          const application = interview.applicationId;
          const candidate = application?.candidateId;
          const jobRequisition = application?.requisitionId;
          const jobTitle = jobRequisition?.templateId?.title || 'Interview';
          const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Candidate';

          return {
            type: 'interview',
            status: interview.status,
            startDate: interview.scheduledDate,
            endDate: new Date(new Date(interview.scheduledDate).getTime() + 60 * 60 * 1000), // +1 hour
            title: `Interview: ${candidateName}`,
            jobTitle,
            candidateName,
            method: interview.method,
            videoLink: interview.videoLink,
            allDay: false,
          };
        }),
      ];

      availability.push({
        memberId: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.workEmail,
        employeeNumber: member.employeeNumber,
        busyPeriods,
      });
    }

    return availability;
  }

  // ============================================================
  // REC-009: RECRUITMENT ANALYTICS & REPORTING
  // ============================================================

  /**
   * REC-009: Calculate time-to-hire for a specific application (in days)
   * Business Rule (BR 33): Monitor recruitment progress with time-to-hire metrics
   * @param applicationId - The application ID
   * @returns Time-to-hire in days, or null if not yet hired
   */
  async calculateTimeToHire(applicationId: string): Promise<number | null> {
    const application = await this.applicationModel.findById(applicationId).exec();

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Check if application is hired
    if (application.status !== ApplicationStatus.HIRED) {
      return null;
    }

    // Get the hire date from application history
    const hireHistory = await this.applicationHistoryModel
      .findOne({
        applicationId: new Types.ObjectId(applicationId),
        newStatus: ApplicationStatus.HIRED,
      })
      .sort({ createdAt: 1 })
      .exec();

    if (!hireHistory) {
      // If no history found, return null
      return null;
    }

    // Calculate time difference in days
    // Use createdAt from application (timestamps: true) as submission date
    const submissionDate = (application as any).createdAt || new Date();
    const hireDate = (hireHistory as any).createdAt || new Date();

    const timeDiffMs = hireDate.getTime() - submissionDate.getTime();
    const timeDiffDays = Math.round(timeDiffMs / (1000 * 60 * 60 * 24));

    return timeDiffDays;
  }

  /**
   * REC-009: Get time-to-hire report with statistics
   * Business Rule (BR 33): Monitor recruitment progress with aggregated metrics
   * @param filters - Optional filters for job requisition, department, date range
   * @returns Time-to-hire statistics (average, median, min, max)
   */
  async getTimeToHireReport(filters?: {
    jobRequisitionId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    averageTimeToHire: number;
    medianTimeToHire: number;
    minTimeToHire: number;
    maxTimeToHire: number;
    totalHiredCandidates: number;
    timeToHireByApplication: Array<{
      applicationId: string;
      candidateName: string;
      jobTitle: string;
      timeToHire: number;
      submissionDate: Date;
      hireDate: Date;
    }>;
  }> {
    // Build query for hired applications
    const query: any = { status: ApplicationStatus.HIRED };

    if (filters?.jobRequisitionId) {
      query.requisitionId = new Types.ObjectId(filters.jobRequisitionId);
    }

    if (filters?.dateFrom || filters?.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.createdAt.$lte = filters.dateTo;
      }
    }

    const hiredApplications = await this.applicationModel
      .find(query)
      .populate('candidateId')
      .populate({
        path: 'requisitionId',
        populate: { path: 'templateId' },
      })
      .exec();

    if (hiredApplications.length === 0) {
      return {
        averageTimeToHire: 0,
        medianTimeToHire: 0,
        minTimeToHire: 0,
        maxTimeToHire: 0,
        totalHiredCandidates: 0,
        timeToHireByApplication: [],
      };
    }

    // Calculate time-to-hire for each application
    const timeToHireData: Array<{
      applicationId: string;
      candidateName: string;
      jobTitle: string;
      timeToHire: number;
      submissionDate: Date;
      hireDate: Date;
    }> = [];

    for (const application of hiredApplications) {
      const hireHistory = await this.applicationHistoryModel
        .findOne({
          applicationId: application._id,
          newStatus: ApplicationStatus.HIRED,
        })
        .sort({ createdAt: 1 })
        .exec();

      if (hireHistory) {
        const submissionDate = (application as any).createdAt || new Date();
        const hireDate = (hireHistory as any).createdAt || new Date();
        const timeToHire = Math.round(
          (hireDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        const candidate = application.candidateId as any;
        const requisition = application.requisitionId as any;
        const jobTitle = requisition?.templateId?.title || 'Unknown Position';

        timeToHireData.push({
          applicationId: application._id.toString(),
          candidateName: candidate?.name || 'Unknown Candidate',
          jobTitle,
          timeToHire,
          submissionDate,
          hireDate,
        });
      }
    }

    // Calculate statistics
    const timeToHireValues = timeToHireData.map((d) => d.timeToHire);
    const sum = timeToHireValues.reduce((acc, val) => acc + val, 0);
    const averageTimeToHire = timeToHireValues.length > 0 ? sum / timeToHireValues.length : 0;

    // Calculate median
    const sortedValues = [...timeToHireValues].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    const medianTimeToHire =
      sortedValues.length % 2 === 0
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid];

    const minTimeToHire = Math.min(...timeToHireValues);
    const maxTimeToHire = Math.max(...timeToHireValues);

    return {
      averageTimeToHire: Math.round(averageTimeToHire * 10) / 10, // Round to 1 decimal
      medianTimeToHire: Math.round(medianTimeToHire * 10) / 10,
      minTimeToHire,
      maxTimeToHire,
      totalHiredCandidates: timeToHireData.length,
      timeToHireByApplication: timeToHireData,
    };
  }

  /**
   * REC-009: Get recruitment funnel data showing conversion rates at each stage
   * Business Rule (BR 33): Monitor recruitment funnel and stage conversion metrics
   * @param jobRequisitionId - Optional job requisition ID to filter by specific job
   * @returns Funnel data with counts and conversion rates at each stage
   */
  async getRecruitmentFunnelData(jobRequisitionId?: string): Promise<{
    totalApplications: number;
    byStage: Array<{
      stage: ApplicationStage;
      count: number;
      percentageOfTotal: number;
      conversionFromPrevious: number;
    }>;
    byStatus: Array<{
      status: ApplicationStatus;
      count: number;
      percentageOfTotal: number;
    }>;
  }> {
    const query: any = {};

    if (jobRequisitionId) {
      query.requisitionId = new Types.ObjectId(jobRequisitionId);
    }

    const allApplications = await this.applicationModel.find(query).exec();
    const totalApplications = allApplications.length;

    if (totalApplications === 0) {
      return {
        totalApplications: 0,
        byStage: [],
        byStatus: [],
      };
    }

    // Count applications by stage
    const hiringStages = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    const byStage = hiringStages.map((stage, index) => {
      const count = allApplications.filter((app) => app.currentStage === stage).length;
      const percentageOfTotal = (count / totalApplications) * 100;

      // Calculate conversion from previous stage
      let conversionFromPrevious = 100; // First stage is 100%
      if (index > 0) {
        // Conversion rate = candidates who reached current stage / candidates who reached previous stage
        // We need to count candidates who are at current stage OR beyond
        const candidatesAtOrBeyondCurrentStage = allApplications.filter((app) => {
          const appStageIndex = hiringStages.indexOf(app.currentStage);
          return appStageIndex >= index;
        }).length;

        const candidatesAtOrBeyondPreviousStage = allApplications.filter((app) => {
          const appStageIndex = hiringStages.indexOf(app.currentStage);
          return appStageIndex >= index - 1;
        }).length;

        conversionFromPrevious =
          candidatesAtOrBeyondPreviousStage > 0
            ? (candidatesAtOrBeyondCurrentStage / candidatesAtOrBeyondPreviousStage) * 100
            : 0;
      }

      return {
        stage,
        count,
        percentageOfTotal: Math.round(percentageOfTotal * 10) / 10,
        conversionFromPrevious: Math.round(conversionFromPrevious * 10) / 10,
      };
    });

    // Count applications by status
    const statuses = Object.values(ApplicationStatus);
    const byStatus = statuses.map((status) => {
      const count = allApplications.filter((app) => app.status === status).length;
      const percentageOfTotal = (count / totalApplications) * 100;

      return {
        status,
        count,
        percentageOfTotal: Math.round(percentageOfTotal * 10) / 10,
      };
    }).filter((item) => item.count > 0); // Only include statuses with applications

    return {
      totalApplications,
      byStage,
      byStatus,
    };
  }

  /**
   * REC-009: Get offer acceptance rate metrics
   * Business Rule (BR 33): Track offer acceptance/rejection rates
   * @param filters - Optional filters for date range and job requisition
   * @returns Offer acceptance statistics
   */
  async getOfferAcceptanceRate(filters?: {
    jobRequisitionId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    totalOffers: number;
    accepted: number;
    rejected: number;
    pending: number;
    acceptanceRate: number;
    rejectionRate: number;
  }> {
    const query: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.createdAt.$lte = filters.dateTo;
      }
    }

    let offers = await this.offerModel.find(query).populate('applicationId').exec();

    // Filter by job requisition if provided
    if (filters?.jobRequisitionId) {
      offers = offers.filter((offer) => {
        const application = offer.applicationId as any;
        return (
          application &&
          application.requisitionId &&
          application.requisitionId.toString() === filters.jobRequisitionId
        );
      });
    }

    const totalOffers = offers.length;

    if (totalOffers === 0) {
      return {
        totalOffers: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
        acceptanceRate: 0,
        rejectionRate: 0,
      };
    }

    const accepted = offers.filter(
      (offer) => offer.applicantResponse === OfferResponseStatus.ACCEPTED || offer.candidateSignedAt !== null,
    ).length;

    const rejected = offers.filter(
      (offer) => offer.applicantResponse === OfferResponseStatus.REJECTED,
    ).length;

    const pending = offers.filter(
      (offer) => offer.applicantResponse === OfferResponseStatus.PENDING || !offer.applicantResponse,
    ).length;

    const acceptanceRate = (accepted / totalOffers) * 100;
    const rejectionRate = (rejected / totalOffers) * 100;

    return {
      totalOffers,
      accepted,
      rejected,
      pending,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      rejectionRate: Math.round(rejectionRate * 10) / 10,
    };
  }

  /**
   * REC-009: Get interview to offer ratio metrics
   * Business Rule (BR 33): Track conversion from interviews to offers
   * @param filters - Optional filters for date range and job requisition
   * @returns Interview to offer conversion statistics
   */
  async getInterviewToOfferRatio(filters?: {
    jobRequisitionId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    totalInterviews: number;
    totalOffers: number;
    interviewToOfferRatio: number;
    averageInterviewsPerHire: number;
    totalHired: number;
  }> {
    const applicationQuery: any = {};

    if (filters?.jobRequisitionId) {
      applicationQuery.requisitionId = new Types.ObjectId(filters.jobRequisitionId);
    }

    if (filters?.dateFrom || filters?.dateTo) {
      applicationQuery.createdAt = {};
      if (filters.dateFrom) {
        applicationQuery.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        applicationQuery.createdAt.$lte = filters.dateTo;
      }
    }

    const applications = await this.applicationModel.find(applicationQuery).exec();
    const applicationIds = applications.map((app) => app._id);

    // Count total interviews
    const totalInterviews = await this.interviewModel
      .countDocuments({
        applicationId: { $in: applicationIds },
        status: { $ne: InterviewStatus.CANCELLED },
      })
      .exec();

    // Count total offers
    const totalOffers = await this.offerModel
      .countDocuments({
        applicationId: { $in: applicationIds },
      })
      .exec();

    // Count total hired
    const totalHired = applications.filter(
      (app) => app.status === ApplicationStatus.HIRED,
    ).length;

    const interviewToOfferRatio = totalOffers > 0 ? totalInterviews / totalOffers : 0;
    const averageInterviewsPerHire = totalHired > 0 ? totalInterviews / totalHired : 0;

    return {
      totalInterviews,
      totalOffers,
      interviewToOfferRatio: Math.round(interviewToOfferRatio * 10) / 10,
      averageInterviewsPerHire: Math.round(averageInterviewsPerHire * 10) / 10,
      totalHired,
    };
  }

  /**
   * REC-009: Get comprehensive recruitment KPIs for dashboard
   * Business Rule (BR 33): Provide high-level recruitment metrics overview
   * @param filters - Optional filters for date range
   * @returns Complete KPI dashboard data
   */
  async getRecruitmentKPIs(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    overview: {
      totalApplications: number;
      openPositions: number;
      activeInterviews: number;
      pendingOffers: number;
      totalHired: number;
    };
    timeToHire: {
      average: number;
      median: number;
    };
    conversionRates: {
      screeningToInterview: number;
      interviewToOffer: number;
      offerToHire: number;
    };
    applicationsByStage: Array<{
      stage: string;
      count: number;
    }>;
    applicationsByStatus: Array<{
      status: string;
      count: number;
    }>;
    trendsOverTime?: Array<{
      date: string;
      applications: number;
      interviews: number;
      offers: number;
      hires: number;
    }>;
  }> {
    const applicationQuery: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      applicationQuery.createdAt = {};
      if (filters.dateFrom) {
        applicationQuery.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        applicationQuery.createdAt.$lte = filters.dateTo;
      }
    }

    // Get all applications
    const allApplications = await this.applicationModel.find(applicationQuery).exec();
    const totalApplications = allApplications.length;

    // Get open positions (published job requisitions)
    const openPositions = await this.jobRequisitionModel
      .countDocuments({ publishStatus: 'published' })
      .exec();

    // Get active interviews
    const activeInterviews = await this.interviewModel
      .countDocuments({
        status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.COMPLETED] },
      })
      .exec();

    // Get pending offers
    const pendingOffers = await this.offerModel
      .countDocuments({
        applicantResponse: OfferResponseStatus.PENDING,
      })
      .exec();

    // Get total hired
    const totalHired = allApplications.filter(
      (app) => app.status === ApplicationStatus.HIRED,
    ).length;

    // Get time-to-hire metrics
    const timeToHireReport = await this.getTimeToHireReport(filters);

    // Get funnel data for conversion rates
    const funnelData = await this.getRecruitmentFunnelData();

    // Calculate conversion rates
    const screeningCount = funnelData.byStage.find(
      (s) => s.stage === ApplicationStage.SCREENING,
    )?.count || 0;

    const interviewStageCount = funnelData.byStage.find(
      (s) => s.stage === ApplicationStage.DEPARTMENT_INTERVIEW,
    )?.count || 0;

    const screeningToInterview =
      screeningCount > 0 ? (interviewStageCount / screeningCount) * 100 : 0;

    // Get interview to offer ratio
    const interviewOfferMetrics = await this.getInterviewToOfferRatio(filters);
    const interviewToOffer =
      interviewOfferMetrics.totalInterviews > 0
        ? (interviewOfferMetrics.totalOffers / interviewOfferMetrics.totalInterviews) * 100
        : 0;

    // Get offer acceptance data
    const offerAcceptanceData = await this.getOfferAcceptanceRate(filters);
    const offerToHire =
      offerAcceptanceData.totalOffers > 0
        ? (offerAcceptanceData.accepted / offerAcceptanceData.totalOffers) * 100
        : 0;

    return {
      overview: {
        totalApplications,
        openPositions,
        activeInterviews,
        pendingOffers,
        totalHired,
      },
      timeToHire: {
        average: timeToHireReport.averageTimeToHire,
        median: timeToHireReport.medianTimeToHire,
      },
      conversionRates: {
        screeningToInterview: Math.round(screeningToInterview * 10) / 10,
        interviewToOffer: Math.round(interviewToOffer * 10) / 10,
        offerToHire: Math.round(offerToHire * 10) / 10,
      },
      applicationsByStage: funnelData.byStage.map((s) => ({
        stage: s.stage,
        count: s.count,
      })),
      applicationsByStatus: funnelData.byStatus.map((s) => ({
        status: s.status,
        count: s.count,
      })),
    };
  }

  /**
   * REC-028: Export candidate personal data for GDPR compliance
   * Business Rule (BR 28, NFR-33): Candidates have the right to export their personal data
   */
  async exportPersonalData(candidateId: string): Promise<any> {
    this.logger.log(`Exporting personal data for candidate ${candidateId}`);

    // Fetch all applications for this candidate
    const applications = await this.applicationModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .populate('requisitionId')
      .exec();

    // Fetch all interviews for this candidate
    const applicationIds = applications.map((app) => app._id);
    const interviews = await this.interviewModel
      .find({ applicationId: { $in: applicationIds } })
      .populate('panel', 'firstName lastName workEmail employeeNumber')
      .exec();

    // Fetch all assessment results for this candidate
    const interviewIds = interviews.map((interview) => interview._id);
    const assessments = await this.assessmentResultModel
      .find({ interviewId: { $in: interviewIds } })
      .populate('interviewerId')
      .exec();

    // Fetch all offers for this candidate
    const offers = await this.offerModel
      .find({ applicationId: { $in: applicationIds } })
      .populate('approvers.approverId')
      .exec();

    // Fetch application history
    const applicationHistory = await this.applicationHistoryModel
      .find({ applicationId: { $in: applicationIds } })
      .sort({ changedAt: 1 })
      .exec();

    // Compile all data
    const personalDataExport = {
      exportDate: new Date().toISOString(),
      candidateId,
      applications: applications.map((app: any) => ({
        applicationId: app._id,
        jobTitle: app.requisitionId?.templateId?.title,
        applicationDate: app.applicationDate,
        currentStage: app.currentStage,
        status: app.status,
        resumeUrl: app.resumeUrl,
        coverLetter: app.coverLetter,
        // GDPR Consent Data
        consentGiven: app.consentGiven,
        consentDataProcessing: app.consentDataProcessing,
        consentBackgroundCheck: app.consentBackgroundCheck,
        consentIpAddress: app.consentIpAddress,
        consentTimestamp: app.consentTimestamp,
      })),
      interviews: interviews.map((interview: any) => ({
        interviewId: interview._id,
        scheduledDate: interview.scheduledDate,
        method: interview.method,
        status: interview.status,
        panelMembers: interview.panel?.map((p: any) => ({
          name: p?.name,
          email: p?.email,
        })),
        location: interview.location,
        videoLink: interview.videoLink,
      })),
      assessments: assessments.map((assessment: any) => ({
        assessmentId: assessment._id,
        score: assessment.score,
        comments: assessment.comments,
        submittedAt: assessment.submittedAt,
        interviewer: {
          name: assessment.interviewerId?.name,
          email: assessment.interviewerId?.email,
        },
      })),
      offers: offers.map((offer: any) => ({
        offerId: offer._id,
        grossSalary: offer.grossSalary,
        signingBonus: offer.signingBonus,
        benefits: offer.benefits,
        startDate: offer.startDate,
        offerDeadline: offer.offerDeadline,
        status: offer.status,
        candidateResponse: offer.candidateResponse,
        candidateResponseDate: offer.candidateResponseDate,
      })),
      applicationHistory: applicationHistory.map((history: any) => ({
        stage: history.stage,
        changedAt: history.changedAt,
        notes: history.notes,
      })),
      gdprNotice: {
        message: 'This export contains all personal data stored in our recruitment system as per GDPR Article 15 (Right of Access).',
        dataRetentionPolicy: 'Application data is retained for 2 years from the last application submission.',
        rightToErasure: 'You may request deletion of your personal data at any time by contacting our HR department.',
      },
    };

    this.logger.log(`Personal data export completed for candidate ${candidateId}`);
    return personalDataExport;
  }

  /**
   * REC-028: Delete candidate personal data (Right to be Forgotten - GDPR Article 17)
   * Business Rule (BR 28, NFR-33): Candidates have the right to request deletion of their personal data
   * NOTE: This anonymizes data rather than deleting to maintain referential integrity for reporting
   */
  async deletePersonalData(candidateId: string, reason?: string): Promise<{
    success: boolean;
    message: string;
    anonymizedRecords: {
      applications: number;
      interviews: number;
      assessments: number;
      offers: number;
    };
  }> {
    this.logger.log(`Processing right to be forgotten request for candidate ${candidateId}. Reason: ${reason || 'not provided'}`);

    // Check if candidate has any active applications (in progress or offers pending)
    const activeApplications = await this.applicationModel.find({
      candidateId: new Types.ObjectId(candidateId),
      status: { $in: [ApplicationStatus.IN_PROCESS, ApplicationStatus.OFFER] },
    });

    if (activeApplications.length > 0) {
      throw new BadRequestException(
        `Cannot delete personal data while applications are in progress. Please withdraw your active applications first or wait until the process is complete.`
      );
    }

    // Find all applications for this candidate
    const applications = await this.applicationModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .exec();

    const applicationIds = applications.map((app) => app._id);

    // Anonymize applications - remove personal identifiable information
    const anonymizedApplicationsCount = await this.applicationModel.updateMany(
      { candidateId: new Types.ObjectId(candidateId) },
      {
        $set: {
          resumeUrl: 'DELETED_GDPR',
          coverLetter: 'Data deleted per GDPR Article 17 (Right to Erasure)',
          consentGiven: false,
          consentDataProcessing: false,
          consentBackgroundCheck: false,
          consentIpAddress: 'ANONYMIZED',
          deletedAt: new Date(),
          deletionReason: reason || 'Candidate requested data deletion (GDPR)',
        } as any,
      }
    );

    // Find all interviews related to these applications
    const interviews = await this.interviewModel
      .find({ applicationId: { $in: applicationIds } })
      .exec();

    const interviewIds = interviews.map((interview) => interview._id);

    // Anonymize interview records (remove video links, location details)
    const anonymizedInterviewsCount = await this.interviewModel.updateMany(
      { applicationId: { $in: applicationIds } },
      {
        $set: {
          videoLink: 'DELETED_GDPR',
          location: 'DELETED_GDPR',
          notes: 'Data deleted per GDPR Article 17',
        } as any,
      }
    );

    // Anonymize assessment results (keep scores for aggregate reporting but remove comments)
    const anonymizedAssessmentsCount = await this.assessmentResultModel.updateMany(
      { interviewId: { $in: interviewIds } },
      {
        $set: {
          comments: 'Data deleted per GDPR Article 17',
        } as any,
      }
    );

    // Anonymize offers (remove salary details but keep status for reporting)
    const anonymizedOffersCount = await this.offerModel.updateMany(
      { applicationId: { $in: applicationIds } },
      {
        $set: {
          grossSalary: 0,
          signingBonus: 0,
          benefits: [],
          conditions: 'Data deleted per GDPR Article 17',
          insurances: 'DELETED_GDPR',
          offerLetterUrl: 'DELETED_GDPR',
        } as any,
      }
    );

    // Note: We keep the candidate record for referential integrity but anonymize it
    // In a real implementation, you might want to update the Candidate schema as well

    this.logger.log(
      `Personal data deletion completed for candidate ${candidateId}. ` +
      `Anonymized: ${anonymizedApplicationsCount.modifiedCount} applications, ` +
      `${anonymizedInterviewsCount.modifiedCount} interviews, ` +
      `${anonymizedAssessmentsCount.modifiedCount} assessments, ` +
      `${anonymizedOffersCount.modifiedCount} offers`
    );

    return {
      success: true,
      message: 'Personal data has been successfully anonymized in compliance with GDPR Article 17 (Right to Erasure).',
      anonymizedRecords: {
        applications: anonymizedApplicationsCount.modifiedCount,
        interviews: anonymizedInterviewsCount.modifiedCount,
        assessments: anonymizedAssessmentsCount.modifiedCount,
        offers: anonymizedOffersCount.modifiedCount,
      },
    };
  }

  /**
   * REC-028: Get consent history for a candidate
   * Business Rule (BR 28, NFR-33): Track all consent given by candidates for audit purposes
   */
  async getConsentHistory(candidateId: string): Promise<any[]> {
    this.logger.log(`Retrieving consent history for candidate ${candidateId}`);

    // Fetch all applications with consent data
    const applications = await this.applicationModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .populate('requisitionId')
      .sort({ applicationDate: -1 })
      .exec();

    const consentHistory = applications.map((app: any) => ({
      applicationId: app._id,
      jobTitle: app.requisitionId?.templateId?.title || 'Unknown Position',
      applicationDate: app.applicationDate,
      consentData: {
        consentGiven: app.consentGiven,
        consentDataProcessing: app.consentDataProcessing,
        consentBackgroundCheck: app.consentBackgroundCheck,
        consentTimestamp: app.consentTimestamp,
        consentIpAddress: app.consentIpAddress,
      },
      currentStatus: app.status,
      isAnonymized: app.resumeUrl === 'DELETED_GDPR',
    }));

    this.logger.log(`Retrieved ${consentHistory.length} consent records for candidate ${candidateId}`);
    return consentHistory;
  }

  /**
   * REC-028: Get applications that are older than retention period (for data cleanup)
   * Business Rule (BR 28, NFR-33): Implement data retention policy
   * Default retention period: 2 years from last application
   */
  async getApplicationsForRetentionCleanup(retentionYears: number = 2): Promise<ApplicationDocument[]> {
    this.logger.log(`Finding applications older than ${retentionYears} years for retention cleanup`);

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    // Find applications older than retention period and not already anonymized
    const oldApplications = await this.applicationModel
      .find({
        applicationDate: { $lt: cutoffDate },
        resumeUrl: { $ne: 'DELETED_GDPR' }, // Not already anonymized
        status: { $in: [ApplicationStatus.REJECTED, ApplicationStatus.HIRED] }, // Completed processes only
      })
      .populate('candidateId')
      .populate('requisitionId')
      .exec();

    this.logger.log(`Found ${oldApplications.length} applications eligible for retention cleanup`);
    return oldApplications;
  }

  // ============================================================================
  // OFFER MANAGEMENT (REC-014, REC-018)
  // Business Rules: BR 26(b, c)
  // ============================================================================

  /**
   * REC-014: Create a new job offer
   * Business Rule (BR 26b): Must support securing related parties' approval before sending out the offer
   */
  async createOffer(createOfferDto: CreateOfferDto): Promise<OfferDocument> {
    const {
      applicationId,
      candidateId,
      hrEmployeeId,
      grossSalary,
      signingBonus,
      benefits,
      conditions,
      insurances,
      content,
      role,
      deadline,
      approvers,
    } = createOfferDto;

    this.logger.log(`Creating offer for application ${applicationId}`);

    // Validate that the application exists and is in a valid state
    const application = await this.applicationModel.findById(applicationId).exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }


    // Approver validation moved to offer acceptance (not required at creation time)

    // Initialize approvers with PENDING status
    const initializedApprovers = approvers?.map((approver: any) => ({
      employeeId: approver.employeeId,
      role: approver.role,
      status: ApprovalStatus.PENDING,
      actionDate: null,
      comment: null,
    })) || [];

    // Auto-approve if no approvers are provided - offer goes directly to candidate
    const autoApproved = initializedApprovers.length === 0;

    // Create the offer
    const offer = new this.offerModel({
      applicationId,
      candidateId,
      hrEmployeeId,
      grossSalary,
      signingBonus,
      benefits,
      conditions,
      insurances,
      content,
      role,
      deadline,
      approvers: initializedApprovers,
      applicantResponse: OfferResponseStatus.PENDING,
      finalStatus: autoApproved ? OfferFinalStatus.APPROVED : OfferFinalStatus.PENDING,
    });

    const savedOffer = await offer.save();

    // Update application status to OFFER
    await this.applicationModel.findByIdAndUpdate(
      applicationId,
      { status: ApplicationStatus.OFFER },
      { new: true }
    );

    // Create history entry
    const historyEntry = new this.applicationHistoryModel({
      applicationId,
      previousStatus: application.status,
      newStatus: ApplicationStatus.OFFER,
      changedBy: new Types.ObjectId(candidateId),
      reason: 'Offer created',
    });
    await historyEntry.save();

    // Notify approvers that approval is needed
    if (initializedApprovers.length > 0) {
      for (const approver of initializedApprovers) {
        this.notificationService.emitForUser(
          approver.employeeId.toString(),
          'Offer Approval Required',
          `Offer approval needed for candidate. Please review and approve/reject the offer.`,
          { offerId: savedOffer._id.toString(), applicationId: applicationId.toString(), action: 'offer_approval_needed' }
        );
      }
      this.logger.log(`Sent approval notifications to ${initializedApprovers.length} approvers`);
    }

    // Notify HR that offer has been created
    if (hrEmployeeId) {
      this.notificationService.emitForUser(
        hrEmployeeId.toString(),
        'Offer Created',
        `Offer created successfully for application ${applicationId}`,
        { offerId: savedOffer._id.toString(), applicationId: applicationId.toString(), action: 'offer_created' }
      );
    }

    // If auto-approved (no approvers), notify the candidate immediately
    if (autoApproved) {
      this.notificationService.emitForUser(
        candidateId.toString(),
        'Job Offer Received',
        `You have received a job offer! Please review and respond by ${savedOffer.deadline.toDateString()}`,
        { offerId: savedOffer._id.toString(), action: 'offer_sent_to_candidate' }
      );
      this.logger.log(`Offer auto-approved and candidate notified`);
    }

    this.logger.log(`Offer created successfully with ID ${savedOffer._id}`);
    return savedOffer;
  }

  /**
   * REC-014: Get offer by ID
   */
  async getOfferById(offerId: string): Promise<OfferDocument> {
    this.logger.log(`Retrieving offer ${offerId}`);

    const offer = await this.offerModel
      .findById(offerId)
      .populate('applicationId')
      .populate('candidateId')
      .populate('hrEmployeeId')
      .populate('approvers.employeeId')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    return offer;
  }

  /**
   * REC-014: Update offer approval status
   * Business Rule (BR 26b): Support multi-level approval workflow
   */
  async updateOfferApprovalStatus(
    offerId: string,
    approverId: string,
    status: 'approved' | 'rejected',
    comment?: string
  ): Promise<OfferDocument> {
    this.logger.log(`Updating approval status for offer ${offerId} by approver ${approverId}`);

    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Find the approver in the approvers list
    const approverIndex = offer.approvers.findIndex(
      (approver: any) => approver.employeeId.toString() === approverId
    );

    if (approverIndex === -1) {
      throw new BadRequestException(`User ${approverId} is not an approver for this offer`);
    }

    // Check if approver has already taken action
    if (offer.approvers[approverIndex].status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Approver has already ${offer.approvers[approverIndex].status} this offer`
      );
    }

    // Update approver status
    offer.approvers[approverIndex].status = status === 'approved' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
    offer.approvers[approverIndex].actionDate = new Date();
    offer.approvers[approverIndex].comment = comment || '';

    // Check if all approvers have approved or if any rejected
    const allApproved = offer.approvers.every((approver: any) => approver.status === ApprovalStatus.APPROVED);
    const anyRejected = offer.approvers.some((approver: any) => approver.status === ApprovalStatus.REJECTED);

    if (anyRejected) {
      offer.finalStatus = OfferFinalStatus.REJECTED;
      this.logger.log(`Offer ${offerId} has been rejected by an approver`);

      // Notify HR about rejection
      if (offer.hrEmployeeId) {
        this.notificationService.emitForUser(
          offer.hrEmployeeId.toString(),
          'Offer Rejected',
          `Offer for application has been rejected by an approver`,
          { offerId, action: 'offer_rejected_by_approver', comment: comment || '' }
        );
      }
    } else if (allApproved) {
      offer.finalStatus = OfferFinalStatus.APPROVED;
      this.logger.log(`Offer ${offerId} has been fully approved`);

      // Notify HR that offer is approved and can be sent
      if (offer.hrEmployeeId) {
        this.notificationService.emitForUser(
          offer.hrEmployeeId.toString(),
          'Offer Approved',
          `Offer has been approved by all parties. You can now send it to the candidate.`,
          { offerId, action: 'offer_fully_approved' }
        );
      }

      // Send offer to candidate via email/notification
      this.notificationService.emitForUser(
        offer.candidateId.toString(),
        'Job Offer Received',
        `You have received a job offer! Please review and respond by ${offer.deadline.toDateString()}`,
        { offerId, action: 'offer_sent_to_candidate' }
      );
    }

    const updatedOffer = await offer.save();

    // Notify the approver that their action was recorded
    this.notificationService.emitForUser(
      approverId,
      'Approval Recorded',
      `Your ${status} for the offer has been recorded`,
      { offerId, action: 'approval_recorded' }
    );

    return updatedOffer;
  }

  /**
   * REC-014: Candidate accepts the offer
   * Business Rule (BR 26c): Once candidate acceptance is received, trigger onboarding module
   */
  async candidateAcceptOffer(offerId: string, candidateId: string): Promise<OfferDocument> {
    this.logger.log(`Candidate ${candidateId} accepting offer ${offerId}`);

    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Verify that the candidate ID matches
    if (offer.candidateId.toString() !== candidateId) {
      throw new BadRequestException('This offer does not belong to you');
    }

    // Check if offer has been approved
    if (offer.finalStatus !== OfferFinalStatus.APPROVED) {
      throw new BadRequestException('This offer has not been approved yet or has been rejected');
    }

    // Check if candidate has already responded
    if (offer.applicantResponse !== OfferResponseStatus.PENDING) {
      throw new BadRequestException(`You have already ${offer.applicantResponse} this offer`);
    }

    // Check if offer deadline has passed
    if (new Date() > offer.deadline) {
      throw new BadRequestException('This offer has expired');
    }

    // Update offer status
    offer.applicantResponse = OfferResponseStatus.ACCEPTED;
    offer.candidateSignedAt = new Date();
    const acceptedOffer = await offer.save();

    // Update application status to HIRED
    await this.applicationModel.findByIdAndUpdate(
      offer.applicationId,
      { status: ApplicationStatus.HIRED },
      { new: true }
    );

    // Create history entry
    const historyEntry = new this.applicationHistoryModel({
      applicationId: offer.applicationId,
      previousStatus: ApplicationStatus.OFFER,
      newStatus: ApplicationStatus.HIRED,
      changedBy: new Types.ObjectId(candidateId),
      reason: 'Offer accepted',
    });
    await historyEntry.save();

    // Notify HR and hiring manager
    if (offer.hrEmployeeId) {
      this.notificationService.emitForUser(
        offer.hrEmployeeId.toString(),
        'Offer Accepted',
        `Candidate has accepted the offer! Initiating onboarding process.`,
        { offerId, candidateId, action: 'offer_accepted' }
      );
    }

    // BR 26c: Trigger onboarding module
    try {
      await this.triggerOnboarding(candidateId, offerId);
      this.logger.log(`Onboarding triggered successfully for candidate ${candidateId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger onboarding: ${error.message}`);
      // Don't fail the acceptance, just log the error
    }

    // Notify candidate of successful acceptance
    this.notificationService.emitForUser(
      candidateId,
      'Offer Accepted',
      `Congratulations! Your offer acceptance has been recorded. You will receive onboarding instructions shortly.`,
      { offerId, action: 'acceptance_confirmed' }
    );

    this.logger.log(`Offer ${offerId} accepted by candidate ${candidateId}`);
    return acceptedOffer;
  }

  /**
   * REC-014: Candidate rejects the offer
   */
  async candidateRejectOffer(offerId: string, candidateId: string, reason?: string): Promise<OfferDocument> {
    this.logger.log(`Candidate ${candidateId} rejecting offer ${offerId}`);

    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Verify that the candidate ID matches
    if (offer.candidateId.toString() !== candidateId) {
      throw new BadRequestException('This offer does not belong to you');
    }

    // Check if candidate has already responded
    if (offer.applicantResponse !== OfferResponseStatus.PENDING) {
      throw new BadRequestException(`You have already ${offer.applicantResponse} this offer`);
    }

    // Update offer status
    offer.applicantResponse = OfferResponseStatus.REJECTED;
    const rejectedOffer = await offer.save();

    // Update application status back to IN_PROCESS or REJECTED
    await this.applicationModel.findByIdAndUpdate(
      offer.applicationId,
      { status: ApplicationStatus.REJECTED },
      { new: true }
    );

    // Create history entry
    const historyEntry = new this.applicationHistoryModel({
      applicationId: offer.applicationId,
      previousStatus: ApplicationStatus.OFFER,
      newStatus: ApplicationStatus.REJECTED,
      changedBy: new Types.ObjectId(candidateId),
      reason: reason || 'Offer rejected by candidate',
    });
    await historyEntry.save();

    // Notify HR and hiring manager
    if (offer.hrEmployeeId) {
      this.notificationService.emitForUser(
        offer.hrEmployeeId.toString(),
        'Offer Rejected by Candidate',
        `Candidate has rejected the offer. Reason: ${reason || 'Not provided'}`,
        { offerId, candidateId, action: 'offer_rejected_by_candidate', reason: reason || 'Not provided' }
      );
    }

    // Notify candidate of rejection confirmation
    this.notificationService.emitForUser(
      candidateId,
      'Offer Rejection Confirmed',
      `Your offer rejection has been recorded. Thank you for your time.`,
      { offerId, action: 'rejection_confirmed' }
    );

    this.logger.log(`Offer ${offerId} rejected by candidate ${candidateId}`);
    return rejectedOffer;
  }

  // ====================================
  // DocuSeal E-Signature Integration
  // ====================================

  /**
   * Create a DocuSeal submission for offer signing
   * Generates an HTML offer letter and creates a submission via DocuSeal API
   * Returns the signing link to be sent to the candidate
   */
  async createDocuSealSubmission(offerId: string): Promise<{ submissionId: number; submitterSlug: string; embedUrl: string }> {
    this.logger.log(`Creating DocuSeal submission for offer ${offerId}`);

    const offer = await this.offerModel
      .findById(offerId)
      .populate('candidateId')
      .populate('applicationId')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Verify offer is approved and ready for signing
    if (offer.finalStatus !== OfferFinalStatus.APPROVED) {
      throw new BadRequestException('This offer has not been approved yet');
    }

    const candidate = offer.candidateId as any;
    const application = offer.applicationId as any;

    // Get candidate email - use personalEmail (from UserProfileBase schema)
    const candidateEmail = candidate.personalEmail || candidate.email;
    const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';

    this.logger.log(`DocuSeal submission - Candidate: ${candidateName}, Email: ${candidateEmail}`);

    if (!candidateEmail) {
      throw new BadRequestException('Candidate email not found. Cannot send DocuSeal signing request.');
    }

    // Generate HTML offer letter
    const offerHtml = this.generateOfferLetterHtml(offer, candidate, application);

    // Get job title for email
    const jobTitle = application?.jobTitle || offer.role || 'the offered position';

    // Call DocuSeal API to create submission
    const docuSealApiUrl = 'https://api.docuseal.com/submissions/html';
    const docuSealToken = process.env.DOCUSEAL_AUTH_TOKEN;

    this.logger.log(`DocuSeal token present: ${!!docuSealToken}, length: ${docuSealToken?.length || 0}`);

    if (!docuSealToken) {
      this.logger.error('DOCUSEAL_AUTH_TOKEN environment variable is not set');
      throw new BadRequestException('DocuSeal API token not configured. Please set DOCUSEAL_AUTH_TOKEN in your .env file and restart the server.');
    }

    try {
      // DocuSeal API requires 'documents' array with HTML content
      const requestBody = {
        documents: [
          {
            name: `Offer Letter - ${jobTitle}`,
            html: offerHtml,
          }
        ],
        // Disable DocuSeal's built-in email - we send our own via EmailJS with the signing URL
        send_email: false,
        submitters: [
          {
            email: candidateEmail,
            name: candidateName,
            role: 'Candidate',
            send_email: false, // We'll send custom email via EmailJS instead
          },
        ],
      };

      this.logger.log(`DocuSeal API request body (submitters): ${JSON.stringify(requestBody.submitters)}`);

      const response = await fetch(docuSealApiUrl, {
        method: 'POST',
        headers: {
          'X-Auth-Token': docuSealToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DocuSeal API error: ${errorText}`);
        throw new BadRequestException(`Failed to create DocuSeal submission: ${errorText}`);
      }

      const data = await response.json();
      this.logger.log(`DocuSeal API response: ${JSON.stringify(data)}`);
      
      // DocuSeal API can return different structures:
      // 1. Array of submitters: [{ submission_id, slug, embed_src }]
      // 2. Object with submitters: { id, submitters: [{ slug, embed_src }] }
      // 3. Direct submission object: { id, slug, embed_src }
      
      let submissionId: number;
      let submitterSlug: string;
      let embedUrl: string;

      if (Array.isArray(data) && data.length > 0) {
        // Response is array of submitters
        const submitter = data[0];
        submissionId = Number(submitter.submission_id || submitter.id);
        submitterSlug = submitter.slug;
        embedUrl = submitter.embed_src || `https://docuseal.com/s/${submitterSlug}`;
      } else if (data.submitters && Array.isArray(data.submitters) && data.submitters.length > 0) {
        // Response has submitters array
        submissionId = Number(data.id);
        const submitter = data.submitters[0];
        submitterSlug = submitter.slug;
        embedUrl = submitter.embed_src || `https://docuseal.com/s/${submitterSlug}`;
      } else if (data.id) {
        // Response is direct submission object
        submissionId = Number(data.id);
        submitterSlug = data.slug || '';
        embedUrl = data.embed_src || data.embed_url || `https://docuseal.com/s/${submitterSlug}`;
      } else {
        this.logger.error(`Unexpected DocuSeal response structure: ${JSON.stringify(data)}`);
        throw new BadRequestException('Unexpected response from DocuSeal API');
      }

      this.logger.log(`DocuSeal submission created: ${submissionId} for offer ${offerId}, email should be sent to: ${candidateEmail}`);
      this.logger.log(`DocuSeal signing URL: ${embedUrl}`);

      // Notify candidate about the offer ready for signing with the link
      this.notificationService.emitForUser(
        offer.candidateId.toString(),
        'Offer Ready for Signing',
        `Your job offer is ready for e-signature. Please sign here: ${embedUrl}`,
        { offerId, signingUrl: embedUrl, action: 'offer_ready_for_signature' }
      );

      return {
        submissionId,
        submitterSlug,
        embedUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to create DocuSeal submission: ${error.message}`);
      throw new BadRequestException(`DocuSeal integration error: ${error.message}`);
    }
  }

  /**
   * Complete DocuSeal signature and update offer status
   * Called when candidate completes signing via DocuSeal webhook or callback
   */
  async completeDocuSealSignature(
    offerId: string,
    data: { submissionId: number; documentUrl?: string }
  ): Promise<OfferDocument> {
    this.logger.log(`Completing DocuSeal signature for offer ${offerId}`);

    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Update offer response status to accepted
    offer.applicantResponse = OfferResponseStatus.ACCEPTED;
    offer.candidateSignedAt = new Date();
    await offer.save();

    // Update application status to HIRED
    await this.applicationModel.findByIdAndUpdate(
      offer.applicationId,
      { status: ApplicationStatus.HIRED },
      { new: true }
    );

    // Create history entry
    const historyEntry = new this.applicationHistoryModel({
      applicationId: offer.applicationId,
      previousStatus: ApplicationStatus.OFFER,
      newStatus: ApplicationStatus.HIRED,
      changedBy: offer.candidateId,
      reason: 'Offer accepted via e-signature',
    });
    await historyEntry.save();

    // Notify HR
    if (offer.hrEmployeeId) {
      this.notificationService.emitForUser(
        offer.hrEmployeeId.toString(),
        'Offer Signed Electronically',
        'Candidate has signed the offer letter electronically. Initiating onboarding process.',
        { offerId, action: 'offer_signed_electronically' }
      );
    }

    // Trigger onboarding
    try {
      await this.triggerOnboarding(offer.candidateId.toString(), offerId);
      this.logger.log(`Onboarding triggered for candidate ${offer.candidateId}`);
    } catch (error) {
      this.logger.error(`Failed to trigger onboarding: ${error.message}`);
    }

    // Notify candidate
    this.notificationService.emitForUser(
      offer.candidateId.toString(),
      'Offer Signed Successfully',
      'Congratulations! Your signed offer has been received. You will receive onboarding instructions shortly.',
      { offerId, action: 'signature_confirmed' }
    );

    this.logger.log(`DocuSeal signature completed for offer ${offerId}`);
    return offer;
  }

  /**
   * Get DocuSeal signing URL for an offer (generates new submission if needed)
   */
  async getDocuSealSigningUrl(offerId: string): Promise<{ embedUrl: string }> {
    const result = await this.createDocuSealSubmission(offerId);
    return { embedUrl: result.embedUrl };
  }

  /**
   * Generate HTML offer letter for DocuSeal
   * Creates a professional offer letter with signature fields
   */
  private generateOfferLetterHtml(offer: any, candidate: any, application: any): string {
    const companyName = 'Your Company Name'; // This should come from organization settings
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 20px 0; }
          .highlight { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
          .signature-section { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 30px; }
          .signature-box { display: inline-block; width: 45%; vertical-align: top; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Employment Offer Letter</h1>
          <p>${companyName}</p>
          <p>${today}</p>
        </div>

        <div class="section">
          <p>Dear ${candidate?.firstName || 'Candidate'} ${candidate?.lastName || ''},</p>
          
          <p>We are pleased to offer you the position of <strong>${application?.jobTitle || offer.jobTitle || 'the offered position'}</strong> 
          at ${companyName}. After careful consideration of your qualifications and experience, 
          we believe you would be a valuable addition to our team.</p>
        </div>

        <div class="section highlight">
          <h3>Position Details</h3>
          <table>
            <tr>
              <th>Position</th>
              <td>${application?.jobTitle || offer.jobTitle || 'N/A'}</td>
            </tr>
            <tr>
              <th>Department</th>
              <td>${offer.department || 'N/A'}</td>
            </tr>
            <tr>
              <th>Start Date</th>
              <td>${offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'To be determined'}</td>
            </tr>
            <tr>
              <th>Employment Type</th>
              <td>${offer.employmentType || 'Full-time'}</td>
            </tr>
          </table>
        </div>

        <div class="section highlight">
          <h3>Compensation Package</h3>
          <table>
            <tr>
              <th>Base Salary</th>
              <td>${offer.baseSalary ? offer.baseSalary.toLocaleString() : 'N/A'} ${offer.currency || 'USD'} per ${offer.salaryPeriod || 'year'}</td>
            </tr>
            ${offer.signingBonus ? `
            <tr>
              <th>Signing Bonus</th>
              <td>${offer.signingBonus.toLocaleString()} ${offer.currency || 'USD'}</td>
            </tr>
            ` : ''}
            ${offer.benefits ? `
            <tr>
              <th>Benefits</th>
              <td>${offer.benefits}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${offer.additionalTerms ? `
        <div class="section">
          <h3>Additional Terms</h3>
          <p>${offer.additionalTerms}</p>
        </div>
        ` : ''}

        <div class="section">
          <p>This offer is contingent upon successful completion of background verification 
          and any other pre-employment requirements. This offer will remain valid until 
          <strong>${offer.deadline ? new Date(offer.deadline).toLocaleDateString() : 'the specified deadline'}</strong>.</p>

          <p>Please indicate your acceptance of this offer by signing below. We are excited 
          about the possibility of you joining our team!</p>

          <p>Sincerely,<br/>
          Human Resources Department<br/>
          ${companyName}</p>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p><strong>Candidate Acceptance</strong></p>
            <p>I, ${candidate?.firstName || ''} ${candidate?.lastName || ''}, accept this offer of employment.</p>
            <p>Signature: <signature-field name="candidate_signature" role="Candidate" required="true" /></p>
            <p>Date: <date-field name="signature_date" role="Candidate" required="true" /></p>
          </div>
        </div>

        <div class="section" style="margin-top: 30px;">
          <p><strong>Full Legal Name:</strong> <text-field name="full_legal_name" role="Candidate" required="true" /></p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * REC-014: Get all offers
   */
  async getAllOffers(): Promise<OfferDocument[]> {
    this.logger.log('Retrieving all offers');

    const offers = await this.offerModel
      .find()
      .populate('applicationId')
      .populate('candidateId')
      .populate('hrEmployeeId')
      .populate('approvers.employeeId')
      .sort({ createdAt: -1 })
      .exec();

    return offers;
  }

  /**
   * REC-014: Get offers pending approval for a specific user
   * Returns offers where the user is an approver and status is pending
   */
  async getOffersPendingApproval(userId: string): Promise<OfferDocument[]> {
    this.logger.log(`Retrieving offers pending approval for user ${userId}`);

    const offers = await this.offerModel
      .find({
        'approvers.employeeId': new Types.ObjectId(userId),
        'approvers.status': ApprovalStatus.PENDING,
      })
      .populate('applicationId')
      .populate('candidateId')
      .sort({ createdAt: -1 })
      .exec();

    return offers;
  }

  /**
   * REC-014: Get offers by application ID
   * Candidates can only view offers for their own applications
   */
  async getOffersByApplicationId(applicationId: string, user?: any): Promise<OfferDocument[]> {
    this.logger.log(`Retrieving offers for application ${applicationId}`);
    this.logger.log(`User context: ${JSON.stringify(user)}`);

    // If user is a candidate, verify they own this application
    if (user && (user.userType === 'candidate' || user.systemRole?.includes(SystemRole.JOB_CANDIDATE))) {
      const application = await this.applicationModel.findById(applicationId).exec();
      if (!application) {
        throw new NotFoundException(`Application with ID ${applicationId} not found`);
      }
      
      this.logger.log(`Application candidateId: ${application.candidateId}`);
      this.logger.log(`User id from JWT: ${user.id}`);
      
      // For candidates, the JWT id IS the candidate's _id directly
      // Check if the application belongs to this candidate
      if (application.candidateId.toString() !== user.id) {
        this.logger.warn(`Candidate ${user.id} tried to access application ${applicationId} owned by ${application.candidateId}`);
        throw new ForbiddenException('You can only view offers for your own applications');
      }
      
      this.logger.log(`Candidate ${user.id} authorized to view offers for application ${applicationId}`);
    }

    // Query for offers - applicationId might be stored as string or ObjectId
    const offers = await this.offerModel
      .find({ 
        $or: [
          { applicationId: new Types.ObjectId(applicationId) },
          { applicationId: applicationId }
        ]
      })
      .populate('candidateId')
      .sort({ createdAt: -1 })
      .exec();
    
    this.logger.log(`Found ${offers.length} offers for application ${applicationId}`);

    return offers;
  }

  /**
   * REC-014: Get offers by candidate ID
   */
  async getOffersByCandidateId(candidateId: string): Promise<OfferDocument[]> {
    this.logger.log(`Retrieving offers for candidate ${candidateId}`);

    const offers = await this.offerModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .populate('applicationId')
      .populate('hrEmployeeId')
      .populate('approvers.employeeId')
      .sort({ createdAt: -1 })
      .exec();

    return offers;
  }

  // ==================================================================================
  // ELECTRONIC SIGNATURE & OFFER LETTER GENERATION (REC-018)
  // ==================================================================================

  /**
   * REC-018: Generate offer letter PDF
   * Business Rule (BR 26a): Generate customizable offer letter with compensation/benefits
   *
   * @param offerId - The ID of the offer
   * @returns Path to the generated PDF file
   */
  async generateOfferLetterPdf(offerId: string): Promise<string> {
    this.logger.log(`Generating offer letter PDF for offer ${offerId}`);

    // Retrieve the offer with populated data
    const offer = await this.offerModel
      .findById(offerId)
      .populate('candidateId')
      .populate('applicationId')
      .populate('hrEmployeeId')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Check if offer has been approved
    if (offer.finalStatus !== OfferFinalStatus.APPROVED) {
      throw new BadRequestException('Offer must be approved before generating PDF');
    }

    const candidate: any = offer.candidateId;
    const application: any = offer.applicationId;
    const hrEmployee: any = offer.hrEmployeeId;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'offer-letters');
    const fs = require('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `offer-letter-${offerId}-${Date.now()}.pdf`;
    const filePath = join(uploadsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('JOB OFFER LETTER', { align: 'center' });
        doc.moveDown();

        // Date
        doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Candidate Information
        doc.fontSize(12).text(`Dear ${candidate.name || 'Candidate'},`, { align: 'left' });
        doc.moveDown();

        // Offer Introduction
        doc.fontSize(11).text(
          `We are pleased to offer you the position of ${offer.role} at our company. ` +
          `We believe your skills and experience will be a valuable asset to our team.`
        );
        doc.moveDown();

        // Position Details
        doc.fontSize(14).text('Position Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Position: ${offer.role}`);
        doc.text(`Start Date: As mutually agreed upon`);
        doc.moveDown();

        // Compensation & Benefits
        doc.fontSize(14).text('Compensation & Benefits', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Gross Salary: $${offer.grossSalary.toLocaleString()} per annum`);

        if (offer.signingBonus && offer.signingBonus > 0) {
          doc.text(`Signing Bonus: $${offer.signingBonus.toLocaleString()}`);
        }

        if (offer.benefits && offer.benefits.length > 0) {
          doc.text(`Benefits: ${offer.benefits.join(', ')}`);
        }

        if (offer.insurances) {
          doc.text(`Insurance Coverage: ${offer.insurances}`);
        }
        doc.moveDown();

        // Terms & Conditions
        if (offer.conditions) {
          doc.fontSize(14).text('Terms & Conditions', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11);
          doc.text(offer.conditions);
          doc.moveDown();
        }

        // Custom Content
        if (offer.content) {
          doc.fontSize(14).text('Additional Information', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11);
          doc.text(offer.content);
          doc.moveDown();
        }

        // Deadline
        doc.fontSize(11);
        doc.text(
          `Please indicate your acceptance of this offer by ${offer.deadline.toLocaleDateString()}. ` +
          `You can accept this offer by signing electronically through our candidate portal.`
        );
        doc.moveDown(2);

        // Signature Section
        doc.fontSize(14).text('Signatures', { underline: true });
        doc.moveDown();

        // Candidate Signature
        doc.fontSize(11);
        doc.text('Candidate Signature: _________________________');
        if (offer.candidateSignedAt) {
          doc.fontSize(9).text(`Signed on: ${offer.candidateSignedAt.toLocaleDateString()}`, { indent: 20 });
        }
        doc.moveDown(1.5);

        // HR Signature
        doc.fontSize(11);
        doc.text('HR Representative: _________________________');
        if (offer.hrSignedAt) {
          doc.fontSize(9).text(`Signed on: ${offer.hrSignedAt.toLocaleDateString()}`, { indent: 20 });
        }
        doc.moveDown(1.5);

        // Manager Signature
        doc.fontSize(11);
        doc.text('Hiring Manager: _________________________');
        if (offer.managerSignedAt) {
          doc.fontSize(9).text(`Signed on: ${offer.managerSignedAt.toLocaleDateString()}`, { indent: 20 });
        }
        doc.moveDown(2);

        // Footer
        doc.fontSize(9).text(
          'This offer is contingent upon successful completion of background checks and reference verification.',
          { align: 'center' }
        );

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Offer letter PDF generated successfully: ${filePath}`);
          resolve(filePath);
        });

        stream.on('error', (error) => {
          this.logger.error(`Error generating PDF: ${error.message}`);
          reject(error);
        });

      } catch (error) {
        this.logger.error(`Failed to generate offer letter PDF: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * REC-018: Send offer letter for electronic signature
   * Business Rule (BR 26d, BR 37): Send offer to candidate and log communication
   *
   * @param offerId - The ID of the offer
   * @returns Updated offer document
   */
  async sendOfferLetterForSignature(offerId: string): Promise<OfferDocument> {
    this.logger.log(`Sending offer letter for signature: ${offerId}`);

    const offer = await this.offerModel.findById(offerId).populate('candidateId').exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Check if offer has been approved
    if (offer.finalStatus !== OfferFinalStatus.APPROVED) {
      throw new BadRequestException('Offer must be approved before sending for signature');
    }

    // Generate the PDF
    const pdfPath = await this.generateOfferLetterPdf(offerId);

    const candidate: any = offer.candidateId;

    // Send notification to candidate with link to sign
    await this.notificationService.emitForUser(
      offer.candidateId.toString(),
      'Offer Letter Ready for Signature',
      `Your offer letter for the position of ${offer.role} is ready for your electronic signature. ` +
      `Please review and sign by ${offer.deadline.toDateString()}.`,
      {
        offerId: offerId,
        action: 'sign_offer_letter',
        pdfPath: pdfPath,
        deadline: offer.deadline
      }
    );

    // Log communication (BR 37)
    this.logger.log(
      `[COMMUNICATION LOG] Offer letter sent to candidate ${candidate.name} (${candidate.email}) ` +
      `for offer ${offerId} on ${new Date().toISOString()}`
    );

    // Update offer with PDF path (store in content field as metadata)
    const metadata = {
      pdfPath: pdfPath,
      sentForSignatureAt: new Date(),
      communicationLog: [
        {
          type: 'offer_sent',
          timestamp: new Date(),
          recipient: candidate.email,
          message: 'Offer letter sent for electronic signature'
        }
      ]
    };

    // Store metadata in content field (append to existing content)
    offer.content = offer.content
      ? `${offer.content}\n\n---METADATA---\n${JSON.stringify(metadata)}`
      : `---METADATA---\n${JSON.stringify(metadata)}`;

    const updatedOffer = await offer.save();

    this.logger.log(`Offer letter sent successfully for offer ${offerId}`);
    return updatedOffer;
  }

  /**
   * REC-018: Record electronic signature from Signature Pad
   * Business Rule (BR 26d, BR 37): Capture and store electronic signatures
   *
   * @param offerId - The ID of the offer
   * @param signatureData - Base64 encoded signature image from Signature Pad
   * @param signerType - Type of signer ('candidate', 'hr', 'manager')
   * @param signerId - ID of the person signing
   * @returns Updated offer document
   */
  async recordSignature(
    offerId: string,
    signatureData: string,
    signerType: 'candidate' | 'hr' | 'manager',
    signerId: string
  ): Promise<OfferDocument> {
    this.logger.log(`Recording ${signerType} signature for offer ${offerId}`);

    const offer = await this.offerModel.findById(offerId).exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Validate signer
    if (signerType === 'candidate' && offer.candidateId.toString() !== signerId) {
      throw new BadRequestException('Invalid candidate ID');
    }

    if (signerType === 'hr' && offer.hrEmployeeId && offer.hrEmployeeId.toString() !== signerId) {
      throw new BadRequestException('Invalid HR employee ID');
    }

    // Create signatures directory if it doesn't exist
    const signaturesDir = join(process.cwd(), 'uploads', 'signatures');
    const fs = require('fs');
    if (!fs.existsSync(signaturesDir)) {
      fs.mkdirSync(signaturesDir, { recursive: true });
    }

    // Save signature image to file system
    const fileName = `signature-${offerId}-${signerType}-${Date.now()}.png`;
    const filePath = join(signaturesDir, fileName);

    // Remove base64 prefix if present
    const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');

    try {
      fs.writeFileSync(filePath, base64Data, 'base64');
      this.logger.log(`Signature saved to: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to save signature: ${error.message}`);
      throw new BadRequestException('Failed to save signature');
    }

    // Update signature timestamp and path in metadata
    const now = new Date();

    switch (signerType) {
      case 'candidate':
        offer.candidateSignedAt = now;
        break;
      case 'hr':
        offer.hrSignedAt = now;
        break;
      case 'manager':
        offer.managerSignedAt = now;
        break;
    }

    // Store signature path in metadata within content field
    const signatureMetadata = {
      type: `${signerType}_signature`,
      timestamp: now,
      signerId: signerId,
      signaturePath: filePath
    };

    // Log communication (BR 37)
    this.logger.log(
      `[COMMUNICATION LOG] ${signerType} signature recorded for offer ${offerId} ` +
      `by user ${signerId} on ${now.toISOString()}`
    );

    // Append signature metadata to content
    offer.content = offer.content
      ? `${offer.content}\n---SIGNATURE_${signerType.toUpperCase()}---\n${JSON.stringify(signatureMetadata)}`
      : `---SIGNATURE_${signerType.toUpperCase()}---\n${JSON.stringify(signatureMetadata)}`;

    const updatedOffer = await offer.save();

    // Send notifications
    if (signerType === 'candidate') {
      // Notify HR when candidate signs
      if (offer.hrEmployeeId) {
        await this.notificationService.emitForUser(
          offer.hrEmployeeId.toString(),
          'Offer Letter Signed by Candidate',
          `The candidate has signed the offer letter for ${offer.role}.`,
          { offerId, action: 'candidate_signed' }
        );
      }
    }

    this.logger.log(`${signerType} signature recorded successfully for offer ${offerId}`);
    return updatedOffer;
  }

  /**
   * REC-018: Get signed offer letter with all signature details
   * Business Rule (BR 37): Retrieve fully executed offer with signatures
   *
   * @param offerId - The ID of the offer
   * @returns Offer document with signature information
   */
  async getSignedOfferLetter(offerId: string): Promise<{
    offer: OfferDocument;
    pdfPath?: string;
    signatures: {
      candidate?: { signedAt: Date; signaturePath?: string };
      hr?: { signedAt: Date; signaturePath?: string };
      manager?: { signedAt: Date; signaturePath?: string };
    };
    isFullyExecuted: boolean;
  }> {
    this.logger.log(`Retrieving signed offer letter for offer ${offerId}`);

    const offer = await this.offerModel
      .findById(offerId)
      .populate('candidateId')
      .populate('applicationId')
      .populate('hrEmployeeId')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Extract metadata and signatures from content field
    let pdfPath: string | undefined;
    const signatures: any = {};

    if (offer.content) {
      // Extract PDF path
      const pdfMatch = offer.content.match(/---METADATA---\n({.*?})/s);
      if (pdfMatch) {
        try {
          const metadata = JSON.parse(pdfMatch[1]);
          pdfPath = metadata.pdfPath;
        } catch (e) {
          this.logger.warn('Failed to parse PDF metadata');
        }
      }

      // Extract candidate signature
      const candidateMatch = offer.content.match(/---SIGNATURE_CANDIDATE---\n({.*?})/s);
      if (candidateMatch && offer.candidateSignedAt) {
        try {
          const sigData = JSON.parse(candidateMatch[1]);
          signatures.candidate = {
            signedAt: offer.candidateSignedAt,
            signaturePath: sigData.signaturePath
          };
        } catch (e) {
          signatures.candidate = { signedAt: offer.candidateSignedAt };
        }
      }

      // Extract HR signature
      const hrMatch = offer.content.match(/---SIGNATURE_HR---\n({.*?})/s);
      if (hrMatch && offer.hrSignedAt) {
        try {
          const sigData = JSON.parse(hrMatch[1]);
          signatures.hr = {
            signedAt: offer.hrSignedAt,
            signaturePath: sigData.signaturePath
          };
        } catch (e) {
          signatures.hr = { signedAt: offer.hrSignedAt };
        }
      }

      // Extract manager signature
      const managerMatch = offer.content.match(/---SIGNATURE_MANAGER---\n({.*?})/s);
      if (managerMatch && offer.managerSignedAt) {
        try {
          const sigData = JSON.parse(managerMatch[1]);
          signatures.manager = {
            signedAt: offer.managerSignedAt,
            signaturePath: sigData.signaturePath
          };
        } catch (e) {
          signatures.manager = { signedAt: offer.managerSignedAt };
        }
      }
    }

    // Check if offer is fully executed (all required signatures present)
    const isFullyExecuted = !!(
      offer.candidateSignedAt &&
      offer.hrSignedAt
      // Manager signature may be optional depending on requirements
    );

    return {
      offer,
      pdfPath,
      signatures,
      isFullyExecuted
    };
  }

  /**
   * REC-029: Trigger onboarding after offer acceptance
   * Business Rule (BR 26c): Once a candidate's acceptance is received, onboarding module should be triggered
   *
   * This method is automatically called when a candidate accepts an offer.
   * It creates:
   * 1. A contract record with the accepted offer details
   * 2. An onboarding record with pre-boarding tasks
   *
   * @param candidateId - The candidate's ID (will become employeeId)
   * @param offerId - The accepted offer ID
   * @returns The created onboarding document
   */
  async triggerOnboarding(candidateId: string, offerId: string): Promise<OnboardingDocument> {
    this.logger.log(`Triggering onboarding for candidate ${candidateId} with offer ${offerId}`);

    // Fetch the offer to get details for contract
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Create a contract record based on the accepted offer
    const contract = new this.contractModel({
      offerId: new Types.ObjectId(offerId),
      acceptanceDate: new Date(),
      grossSalary: offer.grossSalary,
      signingBonus: offer.signingBonus,
      role: offer.role,
      benefits: offer.benefits,
    });
    const savedContract = await contract.save();
    this.logger.log(`Contract created with ID ${savedContract._id}`);

    // Create onboarding record with pre-boarding tasks
    const onboarding = new this.onboardingModel({
      employeeId: new Types.ObjectId(candidateId),
      contractId: savedContract._id,
      completed: false,
    });

    // Add pre-boarding tasks
    onboarding.tasks = await this.createPreboardingTasks(offer.role);

    const savedOnboarding = await onboarding.save();
    this.logger.log(`Onboarding created with ID ${savedOnboarding._id}`);

    // Notify the candidate about onboarding
    this.notificationService.emitForUser(
      candidateId,
      'Onboarding Started',
      `Welcome! Your onboarding process has begun. Please complete the pre-boarding tasks before your start date.`,
      {
        onboardingId: savedOnboarding._id.toString(),
        contractId: savedContract._id.toString(),
        action: 'onboarding_started'
      }
    );

    // Notify HR about new hire onboarding
    if (offer.hrEmployeeId) {
      this.notificationService.emitForUser(
        offer.hrEmployeeId.toString(),
        'New Hire Onboarding Triggered',
        `Onboarding has been initiated for the new hire. Please monitor their progress.`,
        {
          onboardingId: savedOnboarding._id.toString(),
          candidateId,
          action: 'onboarding_triggered'
        }
      );
    }

    return savedOnboarding;
  }

  /**
   * REC-029: Create pre-boarding task checklist
   * Business Rule (BR 26c): Generate standardized pre-boarding tasks
   *
   * @param role - The role for which to create tasks (can customize by role)
   * @returns Array of task objects
   */
  private async createPreboardingTasks(role?: string): Promise<any[]> {
    this.logger.log(`Creating pre-boarding tasks for role: ${role || 'default'}`);

    // Calculate deadlines (assuming start date is 2 weeks from now)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14); // 2 weeks from offer acceptance

    const tasks = [
      {
        name: 'Sign Employment Contract',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days before start
        notes: 'Review and electronically sign your employment contract',
      },
      {
        name: 'Complete Tax Forms (W-4, I-9)',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before start
        notes: 'Fill out required tax forms for payroll processing',
      },
      {
        name: 'Upload Personal Documents',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before start
        notes: 'Upload ID, certifications, and other required documents',
      },
      {
        name: 'Review Employee Handbook',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before start
        notes: 'Read and acknowledge the employee handbook and company policies',
      },
      {
        name: 'Complete Background Check Authorization',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days before start
        notes: 'Authorize background check and provide necessary information',
      },
      {
        name: 'Set Up Direct Deposit',
        department: 'Payroll',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before start
        notes: 'Provide bank account information for direct deposit',
      },
      {
        name: 'Complete Benefits Enrollment',
        department: 'HR',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before start
        notes: 'Review and select your benefits package (health, dental, vision, 401k)',
      },
    ];

    // Add role-specific tasks for technical positions
    if (role && (role.toLowerCase().includes('engineer') || role.toLowerCase().includes('developer'))) {
      tasks.push({
        name: 'IT Account Setup Request',
        department: 'IT',
        status: OnboardingTaskStatus.PENDING,
        deadline: new Date(startDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before start
        notes: 'Provide information for IT account creation and equipment provisioning',
      });
    }

    return tasks;
  }

  /**
   * REC-029: Update task status
   *
   * @param onboardingId - The onboarding record ID
   * @param updateTaskStatusDto - Task status update data
   * @returns Updated onboarding document
   */
  async updateTaskStatus(
    onboardingId: string,
    updateTaskStatusDto: UpdateTaskStatusDto
  ): Promise<OnboardingDocument> {
    this.logger.log(`Updating task status for onboarding ${onboardingId}`);

    const onboarding = await this.onboardingModel.findById(onboardingId).exec();
    if (!onboarding) {
      throw new NotFoundException(`Onboarding record with ID ${onboardingId} not found`);
    }

    // Find the task by ID (using array index as ID)
    const taskIndex = parseInt(updateTaskStatusDto.taskId);
    if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new NotFoundException(`Task with ID ${updateTaskStatusDto.taskId} not found`);
    }

    // Update task status
    onboarding.tasks[taskIndex].status = updateTaskStatusDto.status;
    if (updateTaskStatusDto.notes) {
      onboarding.tasks[taskIndex].notes = updateTaskStatusDto.notes;
    }

    // If task is completed, set completion timestamp
    if (updateTaskStatusDto.status === OnboardingTaskStatus.COMPLETED) {
      onboarding.tasks[taskIndex].completedAt = new Date();
    }

    // Check if all tasks are completed
    const allTasksCompleted = onboarding.tasks.every(
      task => task.status === OnboardingTaskStatus.COMPLETED
    );

    if (allTasksCompleted && !onboarding.completed) {
      onboarding.completed = true;
      onboarding.completedAt = new Date();

      // Notify candidate
      this.notificationService.emitForUser(
        onboarding.employeeId.toString(),
        'Pre-boarding Complete',
        `Congratulations! You have completed all pre-boarding tasks. We look forward to your start date.`,
        { onboardingId, action: 'onboarding_completed' }
      );

      this.logger.log(`All onboarding tasks completed for ${onboardingId}`);
    }

    return await onboarding.save();
  }

  /**
   * REC-029: Upload document for a task
   *
   * @param onboardingId - The onboarding record ID
   * @param uploadTaskDocumentDto - Document upload data
   * @returns Updated onboarding document
   */
  async uploadOnboardingDocument(
    onboardingId: string,
    uploadTaskDocumentDto: UploadTaskDocumentDto
  ): Promise<OnboardingDocument> {
    this.logger.log(`Uploading document for onboarding ${onboardingId}, task ${uploadTaskDocumentDto.taskId}`);

    const onboarding = await this.onboardingModel.findById(onboardingId).exec();
    if (!onboarding) {
      throw new NotFoundException(`Onboarding record with ID ${onboardingId} not found`);
    }

    // Find the task by ID
    const taskIndex = parseInt(uploadTaskDocumentDto.taskId);
    if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new NotFoundException(`Task with ID ${uploadTaskDocumentDto.taskId} not found`);
    }

    // Attach document to task
    onboarding.tasks[taskIndex].documentId = uploadTaskDocumentDto.documentId;

    // Automatically mark task as in progress if it was pending
    if (onboarding.tasks[taskIndex].status === OnboardingTaskStatus.PENDING) {
      onboarding.tasks[taskIndex].status = OnboardingTaskStatus.IN_PROGRESS;
    }

    return await onboarding.save();
  }

  /**
   * REC-029: Get onboarding progress for an employee
   *
   * @param employeeId - The employee's ID
   * @returns Onboarding progress data
   */
  async getOnboardingProgress(employeeId: string): Promise<{
    onboarding: OnboardingDocument;
    progress: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      percentage: number;
    };
    overdueTasks: any[];
  }> {
    this.logger.log(`Getting onboarding progress for employee ${employeeId}`);

    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .populate('contractId')
      .exec();

    if (!onboarding) {
      throw new NotFoundException(`Onboarding record for employee ${employeeId} not found`);
    }

    // Calculate progress
    const total = onboarding.tasks.length;
    const completed = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.COMPLETED).length;
    const inProgress = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.IN_PROGRESS).length;
    const pending = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.PENDING).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Find overdue tasks
    const now = new Date();
    const overdueTasks = onboarding.tasks
      .map((task, index) => ({ ...task, index }))
      .filter(task =>
        task.status !== OnboardingTaskStatus.COMPLETED &&
        task.deadline &&
        new Date(task.deadline) < now
      );

    return {
      onboarding,
      progress: {
        total,
        completed,
        inProgress,
        pending,
        percentage,
      },
      overdueTasks,
    };
  }

  /**
   * REC-029: Get all onboarding records (for HR dashboard)
   *
   * @returns Array of onboarding records with progress
   */
  async getAllOnboardings(): Promise<any[]> {
    this.logger.log('Getting all onboarding records');

    const onboardings = await this.onboardingModel
      .find()
      .populate('employeeId')
      .populate('contractId')
      .exec();

    return onboardings.map(onboarding => {
      const total = onboarding.tasks.length;
      const completed = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.COMPLETED).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        onboarding,
        progress: {
          total,
          completed,
          percentage,
        },
      };
    });
  }

  // ============================================================
  // JOB TEMPLATE MANAGEMENT METHODS
  // ============================================================

  /**
   * Create a new job template
   *
   * @param createJobTemplateDto - Job template data
   * @returns Created job template
   */
  async createJobTemplate(createJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplateDocument> {
    this.logger.log('Creating new job template');
    const jobTemplate = new this.jobTemplateModel(createJobTemplateDto);
    return await jobTemplate.save();
  }

  /**
   * Get all job templates
   *
   * @returns Array of all job templates
   */
  async getAllJobTemplates(): Promise<JobTemplateDocument[]> {
    this.logger.log('Getting all job templates');
    return await this.jobTemplateModel.find().exec();
  }

  /**
   * Get a single job template by ID
   *
   * @param id - Job template ID
   * @returns Job template
   */
  async getJobTemplateById(id: string): Promise<JobTemplateDocument> {
    this.logger.log(`Getting job template by ID: ${id}`);
    const template = await this.jobTemplateModel.findById(id).exec();

    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Update a job template
   *
   * @param id - Job template ID
   * @param updateJobTemplateDto - Updated job template data
   * @returns Updated job template
   */
  async updateJobTemplate(id: string, updateJobTemplateDto: UpdateJobTemplateDto): Promise<JobTemplateDocument> {
    this.logger.log(`Updating job template: ${id}`);

    const template = await this.jobTemplateModel.findByIdAndUpdate(
      id,
      updateJobTemplateDto,
      { new: true, runValidators: true }
    ).exec();

    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Delete a job template
   *
   * @param id - Job template ID
   * @returns Deletion result
   */
  async deleteJobTemplate(id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting job template: ${id}`);

    const result = await this.jobTemplateModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }

    return { message: 'Job template deleted successfully' };
  }
}
