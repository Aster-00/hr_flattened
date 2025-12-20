import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UploadTaskDocumentDto } from './dto/upload-task-document.dto';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { ApplicationStage } from './enums/application-stage.enum';
import { ApplicationStatus } from './enums/application-status.enum';

@Controller('recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
  ) { }

  /**
   * REC-003: Create a new job requisition based on standardized templates
   * Access: HR Manager only
   * BR 2: Each job requisition must include job details (title, department, location, openings)
   * and qualifications and skills (from template)
   */
  @Post('job-requisitions')
  @Roles(SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createJobRequisition(@Body() createJobRequisitionDto: CreateJobRequisitionDto) {
    return await this.recruitmentService.createJobRequisition(createJobRequisitionDto);
  }

  /**
   * Get all job requisitions
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('job-requisitions')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getAllJobRequisitions() {
    return await this.recruitmentService.getAllJobRequisitions();
  }

  /**
   * REC-023: Get all published job requisitions for the company careers page
   * Access: Public (no authentication required)
   * BR 6: Allow automatic posting of approved requisitions to internal and external career sites
   */
  @Get('careers/jobs')
  async getPublishedJobRequisitions() {
    return await this.recruitmentService.getPublishedJobRequisitions();
  }

  /**
   * Submit a job application from the careers page
   * Access: Public (no authentication required)
   * Creates candidate + application records with resume URL
   */
  @Post('careers/apply')
  @HttpCode(HttpStatus.CREATED)
  async submitCareerApplication(
    @Body() createCareerApplicationDto: CreateCareerApplicationDto,
  ) {
    return await this.recruitmentService.submitCareerApplication(
      createCareerApplicationDto,
    );
  }

  /**
   * Submit a job application as an authenticated candidate
   * Access: Authenticated candidates only
   * Uses existing candidate profile from JWT
   */
  @Post('applications/apply/:jobId')
  @Roles(SystemRole.JOB_CANDIDATE)
  @HttpCode(HttpStatus.CREATED)
  async applyAsAuthenticatedCandidate(
    @Param('jobId') jobId: string,
    @Req() req: any,
  ) {
    return await this.recruitmentService.applyAsAuthenticatedCandidate(
      jobId,
      req.user,
    );
  }

  /**
   * Get all applications for the authenticated candidate
   * Access: Authenticated candidates only
   */
  @Get('applications/my-applications')
  @Roles(SystemRole.JOB_CANDIDATE)
  @HttpCode(HttpStatus.OK)
  async getMyApplications(@Req() req: any) {
    return await this.recruitmentService.getMyApplications(req.user);
  }

  /**
   * REC-023: Preview a job requisition formatted for careers page with employer-brand content
   * Access: HR Manager, HR Employee
   * BR 6: Allow preview before posting to ensure openings look professional
   */
  @Get('job-requisitions/:id/preview')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async previewJobRequisitionForCareers(@Param('id') id: string) {
    return await this.recruitmentService.previewJobRequisitionForCareers(id);
  }

  /**
   * Get a single job requisition by ID
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('job-requisitions/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getJobRequisitionById(@Param('id') id: string) {
    return await this.recruitmentService.getJobRequisitionById(id);
  }

  /**
   * Update job requisition
   * Access: HR Manager only
   */
  @Patch('job-requisitions/:id')
  @Roles(SystemRole.HR_MANAGER)
  async updateJobRequisition(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateJobRequisitionDto>,
  ) {
    return await this.recruitmentService.updateJobRequisition(id, updateData);
  }

  /**
   * Update job requisition status (draft, published, closed)
   * Access: HR Manager only
   */
  @Patch('job-requisitions/:id/status')
  @Roles(SystemRole.HR_MANAGER)
  async updateJobRequisitionStatus(
    @Param('id') id: string,
    @Body('status') status: 'draft' | 'published' | 'closed',
  ) {
    return await this.recruitmentService.updateJobRequisitionStatus(id, status);
  }

  /**
   * Delete job requisition
   * Access: HR Manager only
   */
  @Delete('job-requisitions/:id')
  @Roles(SystemRole.HR_MANAGER)
  async deleteJobRequisition(@Param('id') id: string) {
    return await this.recruitmentService.deleteJobRequisition(id);
  }

  // ============================================================
  // JOB TEMPLATE MANAGEMENT ENDPOINTS
  // ============================================================

  /**
   * Create a new job template
   * Access: HR Manager only
   */
  @Post('job-templates')
  @Roles(SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createJobTemplate(@Body() createJobTemplateDto: CreateJobTemplateDto) {
    return await this.recruitmentService.createJobTemplate(createJobTemplateDto);
  }

  /**
   * Get all job templates
   * Access: HR Manager, HR Employee
   */
  @Get('job-templates')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getAllJobTemplates() {
    return await this.recruitmentService.getAllJobTemplates();
  }

  /**
   * Get a single job template by ID
   * Access: HR Manager, HR Employee
   */
  @Get('job-templates/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getJobTemplateById(@Param('id') id: string) {
    return await this.recruitmentService.getJobTemplateById(id);
  }

  /**
   * Update a job template
   * Access: HR Manager only
   */
  @Patch('job-templates/:id')
  @Roles(SystemRole.HR_MANAGER)
  async updateJobTemplate(
    @Param('id') id: string,
    @Body() updateJobTemplateDto: UpdateJobTemplateDto,
  ) {
    return await this.recruitmentService.updateJobTemplate(id, updateJobTemplateDto);
  }

  /**
   * Delete a job template
   * Access: HR Manager only
   */
  @Delete('job-templates/:id')
  @Roles(SystemRole.HR_MANAGER)
  async deleteJobTemplate(@Param('id') id: string) {
    return await this.recruitmentService.deleteJobTemplate(id);
  }

  // ============================================================
  // APPLICATION MANAGEMENT ENDPOINTS
  // ============================================================

  /**
   * REC-004: Update application stage and automatically calculate progress percentage
   * Access: HR Manager, HR Employee, Recruiter
   * BR 9: Each application must be tracked through defined stages
   * (e.g., Screening, Department Interview, HR Interview, Offer)
   */
  @Patch('applications/:id/stage')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async updateApplicationStage(
    @Param('id') applicationId: string,
    @Body() updateApplicationStageDto: UpdateApplicationStageDto,
    @Req() req,
  ) {
    const result = await this.recruitmentService.updateApplicationStage(
      applicationId,
      updateApplicationStageDto.stage,
      updateApplicationStageDto.notes,
      req.user.id,
    );
    // Return application and email notification data for frontend to send via EmailJS
    return {
      application: result.application,
      emailNotification: result.emailNotification,
    };
  }

  /**
   * REC-004: Update application status (submitted, in_process, offer, hired, rejected)
   * Access: HR Manager, HR Employee, Recruiter
   * BR 9: Track application status changes
   */
  @Patch('applications/:id/status')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body() body: { status: ApplicationStatus; rejectionReason?: string; notes?: string },
    @Req() req,
  ) {
    const result = await this.recruitmentService.updateApplicationStatus(
      applicationId,
      body.status,
      body.rejectionReason,
      body.notes,
      req.user?.id,
    );
    return {
      application: result.application,
      emailNotification: result.emailNotification,
    };
  }

  /**
   * REC-004: Get application progress and current stage with history
   * Access: HR Manager, HR Employee, Recruiter
   * BR 9: Track application through defined stages
   */
  @Get('applications/:id/progress')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getApplicationProgress(@Param('id') applicationId: string) {
    return await this.recruitmentService.getApplicationProgress(applicationId);
  }

  /**
   * REC-004: Get all applications with their current stage and progress
   * Access: HR Manager, HR Employee, Recruiter
   * BR 9: Track applications through defined stages
   */
  @Get('applications')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getAllApplicationsWithProgress() {
    return await this.recruitmentService.getAllApplicationsWithProgress();
  }

  /**
   * REC-007: Get a specific application by ID with full details
   * Access: HR Manager, HR Employee, Recruiter
   * BR 12: View application details including resume
   */
  @Get('applications/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getApplicationById(@Param('id') applicationId: string) {
    return await this.recruitmentService.getApplicationById(applicationId);
  }

  /**
   * REC-004: Get applications filtered by stage
   * Access: HR Manager, HR Employee, Recruiter
   * BR 9: Filter applications by their current stage
   */
  @Get('applications/by-stage/:stage')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getApplicationsByStage(@Param('stage') stage: ApplicationStage) {
    return await this.recruitmentService.getApplicationsByStage(stage);
  }

  /**
   * REC-004: Get complete application stage history
   * Access: HR Manager, HR Employee, Recruiter
   * BR 9: View complete history of stage transitions
   */
  @Get('applications/:id/history')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getApplicationHistory(@Param('id') applicationId: string) {
    return await this.recruitmentService.getApplicationHistory(applicationId);
  }

  /**
   * REC-017: Get candidate's own applications with status tracking
   * Access: Candidate only
   * BR 27, BR 36: Candidate Status Tracking must be easily visualized and up-to-date
   */
  @Get('candidate/:candidateId/applications')
  @Roles(SystemRole.JOB_CANDIDATE)
  async getCandidateApplications(@Param('candidateId') candidateId: string) {
    return await this.recruitmentService.getCandidateApplicationsWithStatus(candidateId);
  }

  /**
   * REC-017: Get detailed status for a specific candidate's application
   * Access: Candidate only
   * BR 27, BR 36: Candidate Status Tracking must be easily visualized
   */
  @Get('candidate/:candidateId/applications/:applicationId')
  @Roles(SystemRole.JOB_CANDIDATE)
  async getCandidateApplicationStatus(
    @Param('candidateId') candidateId: string,
    @Param('applicationId') applicationId: string,
  ) {
    return await this.recruitmentService.getCandidateApplicationStatus(
      candidateId,
      applicationId,
    );
  }

  /**
   * REC-017: Get candidate's notifications about application updates
   * Access: Candidate only
   * BR 27, BR 36: System must send automated alerts/emails to candidates
   */
  @Get('candidate/:candidateId/notifications')
  @Roles(SystemRole.JOB_CANDIDATE)
  async getCandidateNotifications(@Param('candidateId') candidateId: string) {
    return await this.recruitmentService.getCandidateNotifications(candidateId);
  }

  /**
   * REC-010: Schedule an interview for an application
   * Access: HR Manager, HR Employee, Recruiter
   * BR 19a, c, d: Schedule interviews and send automatic notifications to interviewers and candidates
   */
  @Post('interviews')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  @HttpCode(HttpStatus.CREATED)
  async scheduleInterview(@Body() scheduleInterviewDto: any) {
    return await this.recruitmentService.scheduleInterview(scheduleInterviewDto);
  }

  /**
   * REC-010: Get all interviews
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('interviews')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getAllInterviews() {
    return await this.recruitmentService.getAllInterviews();
  }

  /**
   * REC-010: Get all interviews for a specific application
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('applications/:applicationId/interviews')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getInterviewsByApplication(@Param('applicationId') applicationId: string) {
    return await this.recruitmentService.getInterviewsByApplication(applicationId);
  }

  /**
   * REC-010: Update an existing interview
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Patch('interviews/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async updateInterview(
    @Param('id') interviewId: string,
    @Body() updateData: any,
  ) {
    return await this.recruitmentService.updateInterview(interviewId, updateData);
  }

  /**
   * REC-010: Cancel an interview
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Patch('interviews/:id/cancel')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async cancelInterview(@Param('id') interviewId: string) {
    return await this.recruitmentService.cancelInterview(interviewId);
  }

  /**
   * REC-011: Submit feedback and score for an interview
   * Access: HR Manager, HR Employee, Panel Members (checked in service)
   * BR 10, BR 22: Allow adding comments and ratings at each stage
   */
  @Post('interviews/:id/feedback')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async submitInterviewFeedback(
    @Param('id') interviewId: string,
    @Body() feedbackData: any,
  ) {
    return await this.recruitmentService.submitInterviewFeedback({
      ...feedbackData,
      interviewId,
    });
  }

  /**
   * REC-011: Get all feedback for a specific interview
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('interviews/:id/feedback')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getInterviewFeedback(@Param('id') interviewId: string) {
    return await this.recruitmentService.getInterviewFeedback(interviewId);
  }

  /**
   * REC-011: Get aggregated score and statistics for an interview
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('interviews/:id/aggregated-score')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getAggregatedInterviewScore(@Param('id') interviewId: string) {
    return await this.recruitmentService.getAggregatedInterviewScore(interviewId);
  }

  /**
   * REC-011: Get interviews pending feedback for a specific interviewer
   * Access: HR Manager, HR Employee (for themselves)
   */
  @Get('interviewers/:id/pending-feedback')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getInterviewerPendingFeedback(@Param('id') interviewerId: string) {
    return await this.recruitmentService.getInterviewerPendingFeedback(interviewerId);
  }

  /**
   * REC-010: Get panel member availability for interview scheduling
   * Access: HR Manager, HR Employee, Recruiter
   * Returns busy periods (leaves and existing interviews) for selected panel members
   */
  @Post('panel-members/availability')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getPanelMemberAvailability(
    @Body('panelMemberIds') panelMemberIds: string[],
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return await this.recruitmentService.getPanelMemberAvailability(
      panelMemberIds,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * REC-030: Tag a candidate as a referral
   * Access: HR Manager, HR Employee
   * BR 14, BR 25: Tag candidates as referrals for higher priority
   */
  @Post('candidates/:candidateId/referral')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async tagCandidateAsReferral(
    @Param('candidateId') candidateId: string,
    @Body() createReferralDto: CreateReferralDto,
  ) {
    return await this.recruitmentService.tagCandidateAsReferral(candidateId, createReferralDto);
  }

  // ============================================================
  // REC-014, REC-018: OFFER MANAGEMENT ENDPOINTS
  // Business Rules: BR 26(b, c)
  // ============================================================

  /**
   * REC-014: Create a new job offer
   * Access: HR Manager, HR Employee
   * BR 26b: Must support securing related parties' approval before sending out the offer
   */
  @Post('offers')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  async createOffer(@Body() createOfferDto: CreateOfferDto) {
    return await this.recruitmentService.createOffer(createOfferDto);
  }

  /**
   * REC-027: Get required approver roles based on salary level
   * Access: HR Manager, HR Employee, Recruiter
   * BR 26b: Helps frontend determine which approvers are needed before creating an offer
   * NOTE: This route must come before offers/:id to avoid route conflict
   */
  @Get('offers/required-approvers')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getRequiredApproverRoles(@Query('salary') salary: string) {
    const grossSalary = parseFloat(salary) || 0;
    const requiredRoles = this.recruitmentService.getRequiredApproverRoles(grossSalary);
    return {
      grossSalary,
      requiredRoles,
      requiresFinanceApproval: requiredRoles.includes('Finance'),
      requiresDepartmentHeadApproval: requiredRoles.includes('Department Head'),
    };
  }

  /**
   * REC-014: Get offers pending approval
   * Access: HR Manager, HR Employee, Department Head (approvers)
   * Returns offers that have pending approvals for authorized users
   * NOTE: This route must come before offers/:id to avoid route conflict
   */
  @Get('offers/approvals')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  async getOffersPendingApproval(@Req() req) {
    return await this.recruitmentService.getOffersPendingApproval(req.user.id);
  }

  /**
   * REC-014: Get all offers
   * Access: HR Manager, HR Employee, Recruiter
   */
  @Get('offers')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getAllOffers() {
    return await this.recruitmentService.getAllOffers();
  }

  /**
   * Get offer letter email data by offer ID
   * Access: HR Manager, HR Employee
   * Note: Frontend should call emailService.sendOfferLetter() with this data
   * NOTE: This route must come before offers/:id to avoid route conflict
   */
  @Get('offers/:id/email-data')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async getOfferEmailData(@Param('id') offerId: string) {
    const offer = await this.recruitmentService.getOfferById(offerId);

    // Get candidate details
    const candidate = offer.candidateId as any;
    const candidateName = candidate.fullName ||
      `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() ||
      'Candidate';
    // Candidate schema uses personalEmail, not email
    const candidateEmail = candidate.personalEmail || candidate.email || '';

    if (!candidateEmail) {
      throw new BadRequestException('Candidate email not found. Please ensure the candidate has a valid email address.');
    }

    // Get application details to find start date
    const application = offer.applicationId as any;
    const jobTitle = application?.requisitionId?.templateId?.title || offer.role || 'Position';

    // Calculate start date (example: 2 weeks from now, or use a field if available)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const startDateStr = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Return email data for frontend to send via EmailJS
    return {
      emailNotification: {
        email: candidateEmail,
        name: candidateName,
        position: jobTitle,
        salary: `$${offer.grossSalary.toLocaleString()}`,
        startDate: startDateStr,
      },
    };
  }

  /**
   * REC-014: Get offer by ID
   * Access: HR Manager, HR Employee, Recruiter, Candidate (for own offers)
   */
  @Get('offers/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE)
  async getOfferById(@Param('id') offerId: string) {
    return await this.recruitmentService.getOfferById(offerId);
  }

  /**
   * REC-014: Get offers by application ID
   * Access: HR Manager, HR Employee, Recruiter, or the Candidate who owns the application
   */
  @Get('applications/:applicationId/offers')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER, SystemRole.JOB_CANDIDATE)
  async getOffersByApplicationId(
    @Param('applicationId') applicationId: string,
    @Req() req: any,
  ) {
    return await this.recruitmentService.getOffersByApplicationId(applicationId, req.user);
  }

  /**
   * REC-014: Get offers by candidate ID
   * Access: HR Manager, HR Employee, Candidate (for own offers)
   */
  @Get('candidates/:candidateId/offers')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  async getOffersByCandidateId(@Param('candidateId') candidateId: string) {
    return await this.recruitmentService.getOffersByCandidateId(candidateId);
  }

  /**
   * REC-014: Approve or reject an offer (by approver)
   * Access: HR Manager, Department Head (approvers)
   * BR 26b: Support multi-level approval workflow
   */
  @Patch('offers/:id/approve')
  @Roles(SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_EMPLOYEE)
  async updateOfferApprovalStatus(
    @Param('id') offerId: string,
    @Body('approverId') approverId: string,
    @Body('status') status: 'approved' | 'rejected',
    @Body('comment') comment?: string,
  ) {
    return await this.recruitmentService.updateOfferApprovalStatus(
      offerId,
      approverId,
      status,
      comment,
    );
  }

  /**
   * REC-014: Candidate accepts the offer
   * Access: Candidate only
   * BR 26c: Once candidate acceptance is received, trigger onboarding module
   */
  @Patch('offers/:id/accept')
  @Roles(SystemRole.JOB_CANDIDATE)
  async candidateAcceptOffer(
    @Param('id') offerId: string,
    @Body('candidateId') candidateId: string,
  ) {
    return await this.recruitmentService.candidateAcceptOffer(offerId, candidateId);
  }

  /**
   * REC-014: Candidate rejects the offer
   * Access: Candidate only
   */
  @Patch('offers/:id/reject')
  @Roles(SystemRole.JOB_CANDIDATE)
  async candidateRejectOffer(
    @Param('id') offerId: string,
    @Body('candidateId') candidateId: string,
    @Body('reason') reason?: string,
  ) {
    return await this.recruitmentService.candidateRejectOffer(offerId, candidateId, reason);
  }

  // ============================================================
  // REC-018: ELECTRONIC SIGNATURE & OFFER LETTER GENERATION
  // Business Rules: BR 26(a, d), BR 37
  // ============================================================

  /**
   * REC-018: Generate offer letter PDF
   * Access: HR Manager, HR Employee
   * BR 26a: Generate customizable offer letter with compensation/benefits
   */
  @Post('offers/:id/generate-pdf')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async generateOfferLetterPdf(@Param('id') offerId: string) {
    const pdfPath = await this.recruitmentService.generateOfferLetterPdf(offerId);
    return {
      offerId,
      pdfPath,
      message: 'Offer letter PDF generated successfully'
    };
  }

  /**
   * REC-018: Send offer letter for electronic signature
   * Access: HR Manager, HR Employee
   * BR 26d, BR 37: Send offer to candidate and log communication
   */
  @Post('offers/:id/send-for-signature')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async sendOfferLetterForSignature(@Param('id') offerId: string) {
    return await this.recruitmentService.sendOfferLetterForSignature(offerId);
  }

  /**
   * REC-018: Record electronic signature from Signature Pad
   * Access: Candidate (for their own), HR Manager, HR Employee, Department Head
   * BR 26d, BR 37: Capture and store electronic signatures
   */
  @Post('offers/:id/sign')
  @Roles(SystemRole.JOB_CANDIDATE, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  async recordSignature(
    @Param('id') offerId: string,
    @Body('signatureData') signatureData: string,
    @Body('signerType') signerType: 'candidate' | 'hr' | 'manager',
    @Body('signerId') signerId: string,
  ) {
    return await this.recruitmentService.recordSignature(
      offerId,
      signatureData,
      signerType,
      signerId
    );
  }

  /**
   * REC-018: Get signed offer letter with all signature details
   * Access: HR Manager, HR Employee, Candidate (for their own offers)
   * BR 37: Retrieve fully executed offer with signatures
   */
  @Get('offers/:id/signed-letter')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE, SystemRole.RECRUITER)
  async getSignedOfferLetter(@Param('id') offerId: string) {
    return await this.recruitmentService.getSignedOfferLetter(offerId);
  }

  // ============================================================
  // DOCUSEAL E-SIGNATURE INTEGRATION
  // ============================================================

  /**
   * Create DocuSeal submission for offer e-signature
   * Sends signing link via email to candidate
   * Access: HR Manager, HR Employee
   */
  @Post('offers/:id/docuseal/create-submission')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async createDocuSealSubmission(@Param('id') offerId: string) {
    return await this.recruitmentService.createDocuSealSubmission(offerId);
  }

  /**
   * Complete DocuSeal signature (webhook/callback from DocuSeal)
   * Marks offer as accepted when candidate signs
   * Access: Public (webhook) or HR roles
   */
  @Post('offers/:id/docuseal/complete')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE, SystemRole.RECRUITER)
  async completeDocuSealSignature(
    @Param('id') offerId: string,
    @Body() data: {
      submissionId: number;
      documentUrl?: string;
    },
  ) {
    return await this.recruitmentService.completeDocuSealSignature(offerId, data);
  }

  /**
   * Get DocuSeal signing URL for an offer
   * Access: HR Manager, HR Employee
   */
  @Get('offers/:id/docuseal/signing-url')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getDocuSealSigningUrl(@Param('id') offerId: string) {
    return await this.recruitmentService.getDocuSealSigningUrl(offerId);
  }

  // ============================================================
  // REC-009: RECRUITMENT ANALYTICS & REPORTING ENDPOINTS
  // ============================================================

  /**
   * REC-009: Get comprehensive recruitment KPIs for dashboard
   * Access: HR Manager, HR Employee
   * BR 33: Provide high-level recruitment metrics overview
   */
  @Get('analytics/kpis')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getRecruitmentKPIs(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    return await this.recruitmentService.getRecruitmentKPIs(filters);
  }

  /**
   * REC-009: Get time-to-hire report with statistics
   * Access: HR Manager, HR Employee
   * BR 33: Monitor recruitment progress with time-to-hire metrics
   */
  @Get('analytics/time-to-hire')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getTimeToHireReport(
    @Query('jobRequisitionId') jobRequisitionId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};

    if (jobRequisitionId) {
      filters.jobRequisitionId = jobRequisitionId;
    }

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    return await this.recruitmentService.getTimeToHireReport(filters);
  }

  /**
   * REC-009: Calculate time-to-hire for a specific application
   * Access: HR Manager, HR Employee
   * BR 33: Monitor individual application time-to-hire
   */
  @Get('analytics/applications/:applicationId/time-to-hire')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async calculateTimeToHire(@Param('applicationId') applicationId: string) {
    return {
      applicationId,
      timeToHire: await this.recruitmentService.calculateTimeToHire(applicationId),
    };
  }

  /**
   * REC-009: Get recruitment funnel data with conversion rates
   * Access: HR Manager, HR Employee
   * BR 33: Monitor recruitment funnel and stage conversion metrics
   */
  @Get('analytics/funnel')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getRecruitmentFunnelData(@Query('jobRequisitionId') jobRequisitionId?: string) {
    return await this.recruitmentService.getRecruitmentFunnelData(jobRequisitionId);
  }

  /**
   * REC-009: Get offer acceptance rate metrics
   * Access: HR Manager, HR Employee
   * BR 33: Track offer acceptance/rejection rates
   */
  @Get('analytics/offer-acceptance')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getOfferAcceptanceRate(
    @Query('jobRequisitionId') jobRequisitionId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};

    if (jobRequisitionId) {
      filters.jobRequisitionId = jobRequisitionId;
    }

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    return await this.recruitmentService.getOfferAcceptanceRate(filters);
  }

  /**
   * REC-009: Get interview to offer ratio metrics
   * Access: HR Manager, HR Employee
   * BR 33: Track conversion from interviews to offers
   */
  @Get('analytics/interview-to-offer')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getInterviewToOfferRatio(
    @Query('jobRequisitionId') jobRequisitionId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};

    if (jobRequisitionId) {
      filters.jobRequisitionId = jobRequisitionId;
    }

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    return await this.recruitmentService.getInterviewToOfferRatio(filters);
  }

  // ============================================================
  // REC-028: GDPR COMPLIANCE ENDPOINTS
  // ============================================================

  /**
   * REC-028: Export candidate personal data (GDPR Article 15 - Right of Access)
   * Access: Candidate (self) or HR Manager
   * BR 28, NFR-33: Candidates have the right to export their personal data
   */
  @Get('candidates/:candidateId/export-personal-data')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  async exportPersonalData(@Param('candidateId') candidateId: string) {
    return await this.recruitmentService.exportPersonalData(candidateId);
  }

  /**
   * REC-028: Delete candidate personal data (GDPR Article 17 - Right to Erasure/Right to be Forgotten)
   * Access: Candidate (self) or HR Manager
   * BR 28, NFR-33: Candidates have the right to request deletion of their personal data
   * NOTE: This anonymizes data rather than deleting to maintain referential integrity
   */
  @Post('candidates/:candidateId/delete-personal-data')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  @HttpCode(HttpStatus.OK)
  async deletePersonalData(
    @Param('candidateId') candidateId: string,
    @Body('reason') reason?: string,
  ) {
    return await this.recruitmentService.deletePersonalData(candidateId, reason);
  }

  /**
   * REC-028: Get consent history for a candidate
   * Access: Candidate (self) or HR Manager
   * BR 28, NFR-33: Track all consent given by candidates for audit purposes
   */
  @Get('candidates/:candidateId/consent-history')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  async getConsentHistory(@Param('candidateId') candidateId: string) {
    return await this.recruitmentService.getConsentHistory(candidateId);
  }

  /**
   * REC-028: Get applications eligible for retention cleanup
   * Access: HR Manager only (admin function)
   * BR 28, NFR-33: Implement data retention policy (default: 2 years)
   */
  @Get('admin/retention-cleanup')
  @Roles(SystemRole.HR_MANAGER)
  async getApplicationsForRetentionCleanup(@Query('retentionYears') retentionYears?: string) {
    const years = retentionYears ? parseInt(retentionYears, 10) : 2;
    return await this.recruitmentService.getApplicationsForRetentionCleanup(years);
  }

  // ============================================================
  // REC-029: ONBOARDING & PRE-BOARDING ENDPOINTS
  // ============================================================

  /**
   * REC-029: Get onboarding progress for an employee
   * Access: Employee (self), HR Manager, or HR Employee
   * BR 26c: Track pre-boarding task completion
   */
  @Get('onboarding/employee/:employeeId')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  async getOnboardingProgress(@Param('employeeId') employeeId: string) {
    return await this.recruitmentService.getOnboardingProgress(employeeId);
  }

  /**
   * REC-029: Get all onboarding records (HR Dashboard)
   * Access: HR Manager or HR Employee
   * BR 26c: Monitor all new hires' onboarding progress
   */
  @Get('onboarding/all')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getAllOnboardings() {
    return await this.recruitmentService.getAllOnboardings();
  }

  /**
   * REC-029: Update task status for an onboarding record
   * Access: Employee (self), HR Manager, or HR Employee
   * BR 26c: Mark pre-boarding tasks as in progress or completed
   */
  @Patch('onboarding/:onboardingId/tasks')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  async updateTaskStatus(
    @Param('onboardingId') onboardingId: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return await this.recruitmentService.updateTaskStatus(onboardingId, updateTaskStatusDto);
  }

  /**
   * REC-029: Upload document for an onboarding task
   * Access: Employee (self), HR Manager, or HR Employee
   * BR 26c: Attach documents to pre-boarding tasks (contract, forms, etc.)
   */
  @Post('onboarding/:onboardingId/documents')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  async uploadOnboardingDocument(
    @Param('onboardingId') onboardingId: string,
    @Body() uploadTaskDocumentDto: UploadTaskDocumentDto,
  ) {
    return await this.recruitmentService.uploadOnboardingDocument(onboardingId, uploadTaskDocumentDto);
  }

  // ============================================================
  // EMAIL DATA ENDPOINTS
  // These endpoints return email data for the frontend to send via EmailJS (client-side only)
  // ============================================================

  /**
   * Get rejection email data for a candidate
   * Access: HR Manager, HR Employee, Recruiter
   * Note: Frontend should call emailService.sendRejectionEmail() with this data
   */
  @Post('email/rejection')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  @HttpCode(HttpStatus.OK)
  async getRejectionEmailData(
    @Body('candidateEmail') candidateEmail: string,
    @Body('candidateName') candidateName: string,
    @Body('position') position: string,
  ) {
    // Return email data for frontend to send via EmailJS
    return {
      emailNotification: {
        email: candidateEmail,
        name: candidateName,
        subject: `Application Update - ${position}`,
        message: `Dear ${candidateName},

Thank you for your interest in the position of ${position} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your time and wish you success in your future endeavors.

Best regards,
HR Department`,
      },
    };
  }

  /**
   * Get offer letter email data for a candidate
   * Access: HR Manager, HR Employee
   * Note: Frontend should call emailService.sendOfferLetter() with this data
   */
  @Post('email/offer')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  async getOfferLetterEmailData(
    @Body('candidateEmail') candidateEmail: string,
    @Body('candidateName') candidateName: string,
    @Body('position') position: string,
    @Body('salary') salary: string,
    @Body('startDate') startDate: string,
  ) {
    // Return email data for frontend to send via EmailJS
    return {
      emailNotification: {
        email: candidateEmail,
        name: candidateName,
        subject: `Job Offer - ${position}`,
        message: `Dear ${candidateName},

Congratulations! We are pleased to offer you the position of ${position}.

Your starting salary will be ${salary} and your start date is ${startDate}.

We are excited to have you join our team and look forward to working with you.

Best regards,
HR Department`,
      },
    };
  }

}
