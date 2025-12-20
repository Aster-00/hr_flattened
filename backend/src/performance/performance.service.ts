import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppraisalTemplate, AppraisalTemplateDocument } from './Models/appraisal-template.schema';
import { AppraisalCycle, AppraisalCycleDocument } from './Models/appraisal-cycle.schema';
import { AppraisalAssignment, AppraisalAssignmentDocument } from './Models/appraisal-assignment.schema';
import { AppraisalRecord, AppraisalRecordDocument } from './Models/appraisal-record.schema';
import { AppraisalDispute, AppraisalDisputeDocument } from './Models/appraisal-dispute.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/Models/employee-profile.schema';
import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto';
import { CreateAppraisalRecordDto, UpdateAppraisalRecordDto } from './dto/create-appraisal-record.dto';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import {
  AppraisalRecordStatus,
  AppraisalAssignmentStatus,
  AppraisalDisputeStatus,
} from './enums/performance.enums';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name)
    private appraisalTemplateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name)
    private appraisalCycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalAssignment.name)
    private appraisalAssignmentModel: Model<AppraisalAssignmentDocument>,
    @InjectModel(AppraisalRecord.name)
    private appraisalRecordModel: Model<AppraisalRecordDocument>,
    @InjectModel(AppraisalDispute.name)
    private appraisalDisputeModel: Model<AppraisalDisputeDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  // ========== APPRAISAL TEMPLATE METHODS ==========

  async createTemplate(dto: CreateAppraisalTemplateDto): Promise<AppraisalTemplateDocument> {
    const template = new this.appraisalTemplateModel({
      ...dto,
      applicableDepartmentIds: dto.applicableDepartmentIds?.map(id => new Types.ObjectId(id)),
      applicablePositionIds: dto.applicablePositionIds?.map(id => new Types.ObjectId(id)),
    });
    return template.save();
  }

  async findAllTemplates(activeOnly?: boolean): Promise<AppraisalTemplateDocument[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.appraisalTemplateModel.find(query)
      .populate({
        path: 'applicableDepartmentIds',
        model: 'Department',
        select: 'name code',
      })
      .populate({
        path: 'applicablePositionIds',
        model: 'Position',
        select: 'title code',
      })
      .exec();
  }

  async findTemplateById(id: string): Promise<AppraisalTemplateDocument> {
    const template = await this.appraisalTemplateModel
      .findById(id)
      .populate({
        path: 'applicableDepartmentIds',
        model: 'Department',
        select: 'name code',
      })
      .populate({
        path: 'applicablePositionIds',
        model: 'Position',
        select: 'title code',
      })
      .exec();
    if (!template) {
      throw new NotFoundException(`Appraisal template with ID ${id} not found`);
    }
    return template;
  }

  async updateTemplate(id: string, dto: UpdateAppraisalTemplateDto): Promise<AppraisalTemplateDocument> {
    const updateData: any = { ...dto };
    if (dto.applicableDepartmentIds) {
      updateData.applicableDepartmentIds = dto.applicableDepartmentIds.map(id => new Types.ObjectId(id));
    }
    if (dto.applicablePositionIds) {
      updateData.applicablePositionIds = dto.applicablePositionIds.map(id => new Types.ObjectId(id));
    }
    
    const template = await this.appraisalTemplateModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!template) {
      throw new NotFoundException(`Appraisal template with ID ${id} not found`);
    }
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const result = await this.appraisalTemplateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Appraisal template with ID ${id} not found`);
    }
  }

  // ========== APPRAISAL CYCLE METHODS ==========

  async createCycle(dto: CreateAppraisalCycleDto): Promise<AppraisalCycleDocument> {
    const cycle = new this.appraisalCycleModel({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      managerDueDate: dto.managerDueDate ? new Date(dto.managerDueDate) : undefined,
      employeeAcknowledgementDueDate: dto.employeeAcknowledgementDueDate
        ? new Date(dto.employeeAcknowledgementDueDate)
        : undefined,
      templateAssignments: dto.templateAssignments?.map(ta => ({
        templateId: new Types.ObjectId(ta.templateId),
        departmentIds: ta.departmentIds?.map(id => new Types.ObjectId(id)) || [],
      })),
    });
    return cycle.save();
  }

  async findAllCycles(): Promise<AppraisalCycleDocument[]> {
    return this.appraisalCycleModel
      .find()
      .populate('templateAssignments.templateId')
      .exec();
  }

  async findCycleById(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.appraisalCycleModel
      .findById(id)
      .populate('templateAssignments.templateId')
      .exec();
    if (!cycle) {
      throw new NotFoundException(`Appraisal cycle with ID ${id} not found`);
    }
    return cycle;
  }

  async updateCycle(id: string, dto: UpdateAppraisalCycleDto): Promise<AppraisalCycleDocument> {
    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.managerDueDate) updateData.managerDueDate = new Date(dto.managerDueDate);
    if (dto.employeeAcknowledgementDueDate) {
      updateData.employeeAcknowledgementDueDate = new Date(dto.employeeAcknowledgementDueDate);
    }
    if (dto.templateAssignments) {
      updateData.templateAssignments = dto.templateAssignments.map(ta => ({
        templateId: new Types.ObjectId(ta.templateId),
        departmentIds: ta.departmentIds?.map(id => new Types.ObjectId(id)) || [],
      }));
    }

    const cycle = await this.appraisalCycleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!cycle) {
      throw new NotFoundException(`Appraisal cycle with ID ${id} not found`);
    }
    return cycle;
  }

  async deleteCycle(id: string): Promise<void> {
    const cycle = await this.appraisalCycleModel.findById(id).exec();
    if (!cycle) {
      throw new NotFoundException(`Appraisal cycle with ID ${id} not found`);
    }

    // Check if there are any assignments linked to this cycle
    const relatedAssignments = await this.appraisalAssignmentModel
      .find({ cycleId: new Types.ObjectId(id) })
      .exec();

    if (relatedAssignments.length > 0) {
      throw new BadRequestException(
        `Cannot delete cycle: ${relatedAssignments.length} assignment(s) are linked to this cycle. Please delete the assignments first.`,
      );
    }

    // Delete the cycle
    await this.appraisalCycleModel.findByIdAndDelete(id).exec();
  }

  // ========== APPRAISAL ASSIGNMENT METHODS ==========

  async createAssignments(
    cycleId: string,
    employeeIds: string[],
    templateId: string,
    creatorId?: string,
  ): Promise<AppraisalAssignmentDocument[]> {
    const cycle = await this.findCycleById(cycleId);
    const template = await this.findTemplateById(templateId);

    const assignments: AppraisalAssignmentDocument[] = [];

    for (const employeeId of employeeIds) {
      const employee = await this.employeeProfileModel.findById(employeeId).exec();
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      // Find manager (supervisor) - this would need to be determined based on org structure
      // For now, assuming managerProfileId needs to be provided or found via org structure
      let managerId: string | null = null;
      
      if (employee.supervisorPositionId) {
        const foundManagerId = await this.findManagerByPosition(employee.supervisorPositionId.toString());
        // Only use the found manager if it's different from the employee
        // If employee is their own manager, treat it as "No Manager"
        if (foundManagerId && foundManagerId !== employeeId) {
          managerId = foundManagerId;
        }
      }

      // Fallback: if no manager found, assign to the creator (HR) so it shows up in manager views
      if (!managerId && creatorId) {
        managerId = creatorId;
      }

      // If no manager found (or employee is their own manager), set to undefined
      // This will be displayed as 'No Manager' in responses
      // This allows HR to create assignments even when org structure isn't fully set up
      // In production, employees should have proper managers assigned

      // Get department for this assignment
      // Priority: Use employee's own department (primaryDepartmentId)
      // The cycle's template assignment departments are used for filtering scope, not for assignment department
      let departmentId: Types.ObjectId | undefined = undefined;
      
      // First priority: Use employee's primaryDepartmentId
      if (employee.primaryDepartmentId) {
        try {
          departmentId = employee.primaryDepartmentId instanceof Types.ObjectId
            ? employee.primaryDepartmentId
            : new Types.ObjectId(String(employee.primaryDepartmentId));
        } catch (err) {
          console.error('Invalid employee primaryDepartmentId:', employee.primaryDepartmentId, err);
        }
      }
      
      // If employee doesn't have a department, check if cycle's template assignment has departments
      // and use the first one as fallback (but this should be rare - employees should have departments)
      if (!departmentId && cycle.templateAssignments && cycle.templateAssignments.length > 0) {
        const normalizedTemplateId = templateId.toString();
        
        const templateAssignment = cycle.templateAssignments.find(
          ta => {
            if (!ta || !ta.templateId) return false;
            
            let taTemplateId: string;
            if (ta.templateId instanceof Types.ObjectId) {
              taTemplateId = ta.templateId.toString();
            } else if (typeof ta.templateId === 'object' && ta.templateId !== null) {
              const populatedId = (ta.templateId as any)._id || (ta.templateId as any).id;
              taTemplateId = populatedId ? populatedId.toString() : String(ta.templateId);
            } else {
              taTemplateId = String(ta.templateId);
            }
            
            return taTemplateId === normalizedTemplateId;
          }
        );

        // Use first department from template assignment as fallback only
        if (templateAssignment?.departmentIds && Array.isArray(templateAssignment.departmentIds) && templateAssignment.departmentIds.length > 0) {
          const deptId = templateAssignment.departmentIds[0];
          if (deptId) {
            try {
              departmentId = deptId instanceof Types.ObjectId 
                ? deptId 
                : new Types.ObjectId(String(deptId));
            } catch (err) {
              console.error('Invalid department ID format:', deptId, err);
            }
          }
        }
      }

      // If still no department, we need to throw an error
      if (!departmentId) {
        throw new BadRequestException(
          `Cannot create assignment: Employee ${employee.firstName} ${employee.lastName} (${employee.employeeNumber}) does not have a department assigned. Please assign a department to the employee or ensure the cycle's template assignment includes departments.`
        );
      }

      const assignment = new this.appraisalAssignmentModel({
        cycleId: new Types.ObjectId(cycleId),
        templateId: new Types.ObjectId(templateId),
        employeeProfileId: new Types.ObjectId(employeeId),
        managerProfileId: managerId ? new Types.ObjectId(managerId) : undefined,
        departmentId: departmentId,
        positionId: employee.primaryPositionId,
        dueDate: cycle.managerDueDate,
      });

      assignments.push(await assignment.save());
    }

    // Transform response to show 'No Manager' when managerProfileId is null/undefined
    return assignments.map(assignment => {
      const assignmentObj = assignment.toObject();
      if (!assignmentObj.managerProfileId) {
        assignmentObj.managerProfileId = 'No Manager' as any;
      }
      return assignmentObj as any;
    });
  }

  private async findManagerByPosition(positionId: string): Promise<string | null> {
    // This is a placeholder - actual implementation would query org structure
    // to find the manager for a given position
    const manager = await this.employeeProfileModel
      .findOne({ primaryPositionId: new Types.ObjectId(positionId) })
      .exec();
    return manager?._id.toString() || null;
  }

  async findAssignmentsByManager(managerId: string): Promise<AppraisalAssignmentDocument[]> {
    // Validate managerId is a valid ObjectId format
    if (!managerId || !Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException(`Invalid manager ID format: ${managerId}`);
    }
    
    return this.appraisalAssignmentModel
      .find({ managerProfileId: new Types.ObjectId(managerId) })
      .populate('employeeProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();
  }

  async findAssignmentsByEmployee(employeeId: string): Promise<AppraisalAssignmentDocument[]> {
    return this.appraisalAssignmentModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();
  }

  async findAssignmentById(id: string): Promise<AppraisalAssignmentDocument> {
    const assignment = await this.appraisalAssignmentModel
      .findById(id)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .populate('departmentId')
      .populate('positionId')
      .exec();
    if (!assignment) {
      throw new NotFoundException(`Appraisal assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    const assignment = await this.appraisalAssignmentModel.findById(id).exec();
    if (!assignment) {
      throw new NotFoundException(`Appraisal assignment with ID ${id} not found`);
    }

    // Check if there are any appraisal records linked to this assignment
    const relatedRecords = await this.appraisalRecordModel
      .find({ assignmentId: new Types.ObjectId(id) })
      .exec();

    if (relatedRecords.length > 0) {
      // Option 1: Prevent deletion if records exist
      throw new BadRequestException(
        `Cannot delete assignment: ${relatedRecords.length} appraisal record(s) are linked to this assignment. Please delete the records first.`,
      );
    }

    // Delete the assignment
    await this.appraisalAssignmentModel.findByIdAndDelete(id).exec();
  }

  async getAssignmentWithTemplate(assignmentId: string, managerId: string, userRoles: string[] = []): Promise<any> {
    const assignment = await this.findAssignmentById(assignmentId);
    
    // Verify manager is authorized OR user is HR (HR can view any assignment)
    const isManager = assignment.managerProfileId && assignment.managerProfileId.toString() === managerId;
    const isHR = userRoles.some(role => 
      [
        SystemRole.HR_MANAGER,
        SystemRole.HR_EMPLOYEE,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN
      ].includes(role as SystemRole)
    );
    
    if (!isManager && !isHR) {
      throw new ForbiddenException('You are not authorized to view this assignment');
    }

    // Get the template - it's already populated from findAssignmentById
    // Since it's populated, we can use it directly
    const template = assignment.templateId;
    
    // Get existing record if any
    const existingRecord = await this.appraisalRecordModel
      .findOne({ assignmentId: assignment._id })
      .exec();

    // Update assignment status to IN_PROGRESS if it's NOT_STARTED
    if (assignment.status === AppraisalAssignmentStatus.NOT_STARTED) {
      await this.appraisalAssignmentModel
        .findByIdAndUpdate(assignment._id, { status: AppraisalAssignmentStatus.IN_PROGRESS })
        .exec();
      // Update the assignment object to reflect the status change
      assignment.status = AppraisalAssignmentStatus.IN_PROGRESS;
    }

    return {
      assignment,
      template,
      existingRecord,
    };
  }

  // ========== APPRAISAL RECORD (MANAGER RATING) METHODS ==========

  async createOrUpdateAppraisalRecord(
    assignmentId: string,
    managerId: string,
    dto: CreateAppraisalRecordDto | UpdateAppraisalRecordDto,
    userRoles: string[] = [],
  ): Promise<AppraisalRecordDocument> {
    const assignment = await this.findAssignmentById(assignmentId);

    // Verify manager is authorized OR user is HR (HR can create records for any assignment)
    const assignedManagerId = assignment.managerProfileId?._id 
      ? assignment.managerProfileId._id.toString() 
      : assignment.managerProfileId?.toString() || String(assignment.managerProfileId);
    
    const isManager = assignedManagerId === managerId;
    const isHR = userRoles.some(role => 
      [
        SystemRole.HR_MANAGER,
        SystemRole.HR_EMPLOYEE,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN
      ].includes(role as SystemRole)
    );
    
    if (!isManager && !isHR) {
      throw new ForbiddenException('You are not authorized to create appraisals for this assignment');
    }

    // Check if record already exists
    let record = await this.appraisalRecordModel
      .findOne({ assignmentId: new Types.ObjectId(assignmentId) })
      .exec();

    // Get template to calculate scores - it's already populated from findAssignmentById
    let template: AppraisalTemplateDocument;
    const templateIdValue = assignment.templateId as any;
    
    // Check if it's populated (has properties like 'name', 'templateType', etc. that indicate it's a populated document)
    if (templateIdValue && typeof templateIdValue === 'object' && 'name' in templateIdValue && 'templateType' in templateIdValue) {
      // Already populated
      template = templateIdValue as AppraisalTemplateDocument;
    } else {
      // Not populated, extract ID and fetch it
      const templateId = templateIdValue instanceof Types.ObjectId
        ? templateIdValue.toString()
        : templateIdValue?._id
        ? templateIdValue._id.toString()
        : typeof templateIdValue === 'string'
        ? templateIdValue
        : String(templateIdValue);
      template = await this.findTemplateById(templateId);
    }

    // Transform ratings from DTO format (criterionKey/score/comment) to schema format (key/title/ratingValue/comments)
    let transformedRatings: any[] = [];
    if (dto.ratings && dto.ratings.length > 0) {
      transformedRatings = dto.ratings.map((rating: any) => {
        // Handle both formats: new format (criterionKey/score) or old format (key/ratingValue)
        const key = rating.criterionKey || rating.key;
        const ratingValue = rating.score !== undefined ? rating.score : rating.ratingValue;
        const comment = rating.comment || rating.comments;
        
        // Find the criterion in template to get the title
        const criterion = template.criteria.find(c => c.key === key);
        const title = criterion?.title || rating.title || key;
        
        return {
          key,
          title,
          ratingValue,
          comments: comment,
          weightedScore: criterion ? (ratingValue * (criterion.weight || 0) / 100) : undefined,
        };
      });
    }

    // Helper function to safely extract ObjectId from potentially populated fields
    const toObjectId = (value: any): Types.ObjectId => {
      if (!value) return null as any;
      if (value instanceof Types.ObjectId) return value;
      if (typeof value === 'string') return new Types.ObjectId(value);
      if (value && typeof value === 'object') {
        const obj = value as any;
        if ('_id' in obj) {
          return obj._id instanceof Types.ObjectId ? obj._id : new Types.ObjectId(obj._id);
        }
      }
      return new Types.ObjectId(String(value));
    };

    // Get managerProfileId from assignment (handle null case - use employee ID as fallback since schema requires it)
    let managerProfileIdValue: Types.ObjectId;
    if (assignment.managerProfileId) {
      managerProfileIdValue = toObjectId(assignment.managerProfileId);
    } else {
      // If no manager assigned, use employee ID as fallback (self-managed)
      managerProfileIdValue = toObjectId(assignment.employeeProfileId);
    }

    // Map overallComment to managerSummary if provided
    const recordData: any = {
      ratings: transformedRatings,
      assignmentId: new Types.ObjectId(assignmentId),
      cycleId: toObjectId(assignment.cycleId),
      templateId: toObjectId(template._id),
      employeeProfileId: toObjectId(assignment.employeeProfileId),
      managerProfileId: managerProfileIdValue,
    };
    
    // Map overallComment to managerSummary
    if (dto.overallComment && !dto.managerSummary) {
      recordData.managerSummary = dto.overallComment;
    } else if (dto.managerSummary) {
      recordData.managerSummary = dto.managerSummary;
    }
    
    // Add other optional fields from DTO
    if (dto.strengths) recordData.strengths = dto.strengths;
    if (dto.improvementAreas) recordData.improvementAreas = dto.improvementAreas;

    if (record) {
      // Update existing record
      if (record.status !== AppraisalRecordStatus.DRAFT) {
        throw new BadRequestException('Cannot update a submitted appraisal record');
      }
      // Always set required fields to ensure they're not undefined
      record.assignmentId = recordData.assignmentId;
      record.cycleId = recordData.cycleId;
      record.templateId = recordData.templateId;
      record.employeeProfileId = recordData.employeeProfileId;
      record.managerProfileId = recordData.managerProfileId;
      // Update changeable fields
      record.ratings = recordData.ratings;
      if (recordData.managerSummary !== undefined) record.managerSummary = recordData.managerSummary;
      if (recordData.strengths !== undefined) record.strengths = recordData.strengths;
      if (recordData.improvementAreas !== undefined) record.improvementAreas = recordData.improvementAreas;
    } else {
      // Create new record
      record = new this.appraisalRecordModel({
        ...recordData,
        status: AppraisalRecordStatus.DRAFT,
      });
    }

    // Calculate total score and rating label from ratings
    if (transformedRatings.length > 0) {
      const calculated = this.calculateAppraisalScore(transformedRatings, template);
      record.totalScore = calculated.totalScore;
      record.overallRatingLabel = calculated.ratingLabel;
    }

    return record.save();
  }

  async submitAppraisalRecord(recordId: string, managerId: string): Promise<AppraisalRecordDocument> {
    const record = await this.appraisalRecordModel.findById(recordId).exec();
    if (!record) {
      throw new NotFoundException(`Appraisal record with ID ${recordId} not found`);
    }

    if (!record.managerProfileId) {
      throw new BadRequestException('No manager assigned to this appraisal record');
    }

    if (record.managerProfileId.toString() !== managerId) {
      throw new ForbiddenException('You are not authorized to submit this appraisal record');
    }

    if (record.status !== AppraisalRecordStatus.DRAFT) {
      throw new BadRequestException('This appraisal record has already been submitted');
    }

    record.status = AppraisalRecordStatus.MANAGER_SUBMITTED;
    record.managerSubmittedAt = new Date();

    // Update assignment status
    await this.appraisalAssignmentModel
      .findByIdAndUpdate(record.assignmentId, {
        status: AppraisalAssignmentStatus.SUBMITTED,
        submittedAt: new Date(),
        latestAppraisalId: record._id,
      })
      .exec();

    return record.save();
  }

  async publishAppraisalRecord(recordId: string, hrEmployeeId: string): Promise<AppraisalRecordDocument> {
    const record = await this.appraisalRecordModel
      .findById(recordId)
      .populate('employeeProfileId')
      .exec();
    if (!record) {
      throw new NotFoundException(`Appraisal record with ID ${recordId} not found`);
    }

    if (record.status !== AppraisalRecordStatus.MANAGER_SUBMITTED) {
      throw new BadRequestException('Appraisal record must be submitted by manager before publishing');
    }

    record.status = AppraisalRecordStatus.HR_PUBLISHED;
    record.hrPublishedAt = new Date();
    record.publishedByEmployeeId = new Types.ObjectId(hrEmployeeId);

    // Update assignment status
    await this.appraisalAssignmentModel
      .findByIdAndUpdate(record.assignmentId, {
        status: AppraisalAssignmentStatus.PUBLISHED,
        publishedAt: new Date(),
      })
      .exec();

    const savedRecord = await record.save();

    // Link appraisal to employee profile
    await this.linkAppraisalToEmployee(savedRecord);

    return savedRecord;
  }

  private async linkAppraisalToEmployee(record: AppraisalRecordDocument): Promise<void> {
    const employee = (await this.employeeProfileModel
      .findById(record.employeeProfileId)
      .exec()) as EmployeeProfileDocument | null;

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    // Get template to get rating scale type
    const template = await this.findTemplateById(record.templateId.toString());

    // Update employee profile with last appraisal fields AND add to appraisals array
    await this.employeeProfileModel.findByIdAndUpdate(
      record.employeeProfileId,
      {
        $set: {
          lastAppraisalRecordId: record._id,
          lastAppraisalCycleId: record.cycleId,
          lastAppraisalTemplateId: record.templateId,
          lastAppraisalDate: record.hrPublishedAt || new Date(),
          lastAppraisalScore: record.totalScore,
          lastAppraisalRatingLabel: record.overallRatingLabel,
          lastAppraisalScaleType: template.ratingScale.type,
        },
        $addToSet: { appraisals: record._id }, // Add to historical appraisals array (avoids duplicates)
      },
      { new: true }
    ).exec();
  }

  async findAppraisalRecordById(id: string): Promise<AppraisalRecordDocument> {
    const record = await this.appraisalRecordModel
      .findById(id)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .populate('assignmentId')
      .exec();
    if (!record) {
      throw new NotFoundException(`Appraisal record with ID ${id} not found`);
    }
    return record;
  }

  async findAppraisalRecordsByEmployee(employeeId: string): Promise<AppraisalRecordDocument[]> {
    return this.appraisalRecordModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .populate('cycleId')
      .populate('templateId')
      .populate('managerProfileId')
      .sort({ hrPublishedAt: -1 })
      .exec();
  }

  async findAppraisalRecordsByManager(managerId: string): Promise<AppraisalRecordDocument[]> {
    return this.appraisalRecordModel
      .find({ managerProfileId: new Types.ObjectId(managerId) })
      .populate('employeeProfileId')
      .populate('cycleId')
      .populate('templateId')
      .sort({ managerSubmittedAt: -1 })
      .exec();
  }

  async viewAppraisalRecord(recordId: string, employeeId: string, userRoles: string[] = []): Promise<AppraisalRecordDocument> {
    const record = await this.findAppraisalRecordById(recordId);

    // Helper function to safely extract ID string
    const getIdString = (value: any): string => {
      if (!value) return '';
      if (value instanceof Types.ObjectId) return value.toString();
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const obj = value as any;
        if ('_id' in obj) {
          return obj._id instanceof Types.ObjectId ? obj._id.toString() : String(obj._id);
        }
      }
      return String(value);
    };

    // Check if user is HR (HR can view any appraisal)
    const isHR = userRoles.some(role => 
      [
        SystemRole.HR_MANAGER,
        SystemRole.HR_EMPLOYEE,
        SystemRole.HR_ADMIN,
        SystemRole.SYSTEM_ADMIN
      ].includes(role as SystemRole)
    );

    // Check if user is the manager of this appraisal
    const managerId = getIdString(record.managerProfileId);
    const isManager = managerId === employeeId;

    // Check if user is the employee
    const employeeIdValue = getIdString(record.employeeProfileId);
    const isEmployee = employeeIdValue === employeeId;

    // Verify authorization: employee, manager, or HR
    if (!isEmployee && !isManager && !isHR) {
      throw new ForbiddenException('You are not authorized to view this appraisal');
    }

    // Only regular employees (not HR/Manager) need the appraisal to be published to view it
    // Managers and HR can view drafts regardless of their employee status
    if (isEmployee && !isHR && !isManager && record.status !== AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException('Appraisal is not yet published');
    }

    // Mark as viewed by employee if not already viewed (only for employees)
    if (isEmployee && !record.employeeViewedAt) {
      record.employeeViewedAt = new Date();
      await record.save();
    }

    return record;
  }

  async acknowledgeAppraisalRecord(
    recordId: string,
    employeeId: string,
    comment?: string,
  ): Promise<AppraisalRecordDocument> {
    const record = await this.findAppraisalRecordById(recordId);

    // Helper function to safely extract ID string
    const getIdString = (value: any): string => {
      if (!value) return '';
      if (value instanceof Types.ObjectId) return value.toString();
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const obj = value as any;
        if ('_id' in obj) {
          return obj._id instanceof Types.ObjectId ? obj._id.toString() : String(obj._id);
        }
      }
      return String(value);
    };

    // Verify employee owns this appraisal
    const employeeIdValue = getIdString(record.employeeProfileId);
    if (employeeIdValue !== employeeId) {
      throw new ForbiddenException('You can only acknowledge your own appraisals');
    }

    // Check if appraisal is published
    if (record.status !== AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException('Appraisal is not yet published');
    }

    // Check if already acknowledged
    if (record.employeeAcknowledgedAt) {
      throw new BadRequestException('Appraisal has already been acknowledged');
    }

    record.employeeAcknowledgedAt = new Date();
    record.employeeAcknowledgementComment = comment;

    // Update assignment status
    await this.appraisalAssignmentModel
      .findByIdAndUpdate(record.assignmentId, {
        status: AppraisalAssignmentStatus.ACKNOWLEDGED,
      })
      .exec();

    return record.save();
  }

  private calculateAppraisalScore(ratings: any[], template: AppraisalTemplateDocument): {
    totalScore: number;
    ratingLabel: string;
  } {
    let totalScore = 0;
    let totalWeight = 0;
    const scale = template.ratingScale;
    const scaleMax = scale.max || 100;
    const scaleMin = scale.min || 0;
    const scaleRange = scaleMax - scaleMin;

    // Calculate weighted score
    for (const rating of ratings) {
      const criterion = template.criteria.find(c => c.key === rating.key);
      if (criterion) {
        const weight = criterion.weight || 1;
        // Normalize ratingValue to 0-100 scale first, then apply weight
        // ratingValue is on the scale (min to max), convert to percentage
        const normalizedRating = ((rating.ratingValue - scaleMin) / scaleRange) * 100;
        const weightedScore = normalizedRating * (weight / 100);
        totalScore += weightedScore;
        totalWeight += weight;
      } else {
        // If no criterion found, normalize and add the rating value
        const normalizedRating = ((rating.ratingValue - scaleMin) / scaleRange) * 100;
        totalScore += normalizedRating;
        totalWeight += 100; // Assume equal weight if no criterion
      }
    }

    // Normalize if weights don't sum to 100
    if (totalWeight > 0 && totalWeight !== 100) {
      totalScore = (totalScore / totalWeight) * 100;
    }

    // Ensure totalScore is between 0 and 100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Determine rating label based on scale
    const normalizedScore = totalScore;
    let ratingLabel = '';

    if (scale.labels && scale.labels.length > 0) {
      // Use labels if provided - map score (0-100) to label index
      const percentage = normalizedScore; // Already 0-100
      const index = Math.min(
        Math.floor((percentage / 100) * scale.labels.length),
        scale.labels.length - 1,
      );
      ratingLabel = scale.labels[index];
    } else {
      // Generate label based on score percentage
      const percentage = normalizedScore; // Already 0-100
      if (percentage >= 90) ratingLabel = 'Excellent';
      else if (percentage >= 75) ratingLabel = 'Good';
      else if (percentage >= 60) ratingLabel = 'Satisfactory';
      else if (percentage >= 50) ratingLabel = 'Needs Improvement';
      else ratingLabel = 'Unsatisfactory';
    }

    return { totalScore: Math.round(totalScore * 100) / 100, ratingLabel };
  }

  // ========== DISPUTE METHODS ==========

  async createDispute(dto: CreateDisputeDto, employeeId: string): Promise<AppraisalDisputeDocument> {
    const record = await this.findAppraisalRecordById(dto.appraisalId);

    // Helper function to safely extract ID string
    const getIdString = (value: any): string => {
      if (!value) return '';
      if (value instanceof Types.ObjectId) return value.toString();
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const obj = value as any;
        if ('_id' in obj) {
          return obj._id instanceof Types.ObjectId ? obj._id.toString() : String(obj._id);
        }
      }
      return String(value);
    };

    // Verify employee owns this appraisal
    const employeeIdValue = getIdString(record.employeeProfileId);
    if (employeeIdValue !== employeeId) {
      throw new ForbiddenException('You can only dispute your own appraisals');
    }

    // Check if appraisal is published
    if (record.status !== AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException('Can only dispute published appraisals');
    }

    // Check if dispute already exists
    const existingDispute = await this.appraisalDisputeModel
      .findOne({
        appraisalId: new Types.ObjectId(dto.appraisalId),
        status: { $in: [AppraisalDisputeStatus.OPEN, AppraisalDisputeStatus.UNDER_REVIEW] },
      })
      .exec();

    if (existingDispute) {
      throw new BadRequestException('An open dispute already exists for this appraisal');
    }

    // Check 7-day window (if hrPublishedAt exists)
    if (record.hrPublishedAt) {
      const daysSincePublished = (Date.now() - record.hrPublishedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished > 7) {
        throw new BadRequestException('Dispute window has expired (7 days from publication)');
      }
    }

    // Get assignment ID safely
    const assignmentIdValue = getIdString(record.assignmentId);
    const assignment = await this.findAssignmentById(assignmentIdValue);

    // Helper function to convert to ObjectId (ensures non-null)
    const toObjectId = (value: any): Types.ObjectId => {
      if (!value) {
        throw new BadRequestException('Missing required field for dispute creation');
      }
      if (value instanceof Types.ObjectId) return value;
      if (typeof value === 'string') return new Types.ObjectId(value);
      if (value && typeof value === 'object') {
        const obj = value as any;
        if ('_id' in obj) {
          return obj._id instanceof Types.ObjectId ? obj._id : new Types.ObjectId(obj._id);
        }
        // If it's a populated object without _id, try to use the object itself
        if (obj.toString && typeof obj.toString === 'function') {
          const str = obj.toString();
          if (str.match(/^[0-9a-fA-F]{24}$/)) {
            return new Types.ObjectId(str);
          }
        }
      }
      return new Types.ObjectId(String(value));
    };

    // Ensure we have valid ObjectIds
    const assignmentIdObj = toObjectId(record.assignmentId);
    const cycleIdObj = toObjectId(record.cycleId);

    // Validate all required fields are present
    if (!assignmentIdObj || !cycleIdObj) {
      throw new BadRequestException('Missing required assignment or cycle information');
    }

    const disputeData: any = {
      _id: new Types.ObjectId(), // Explicitly generate _id to work around schema issue
      appraisalId: new Types.ObjectId(dto.appraisalId),
      assignmentId: assignmentIdObj,
      cycleId: cycleIdObj,
      raisedByEmployeeId: new Types.ObjectId(employeeId),
      reason: dto.reason,
      status: AppraisalDisputeStatus.OPEN,
      submittedAt: new Date(),
    };

    if (dto.details) {
      disputeData.details = dto.details;
    }

    // Use create() with explicit _id
    const dispute = await this.appraisalDisputeModel.create(disputeData);

    return dispute;
  }

  async findAllDisputes(status?: AppraisalDisputeStatus): Promise<AppraisalDisputeDocument[]> {
    const query = status ? { status } : {};
    return this.appraisalDisputeModel
      .find(query)
      .populate({
        path: 'appraisalId',
        populate: {
          path: 'assignmentId',
          populate: {
            path: 'employeeProfileId',
          },
        },
      })
      .populate('assignmentId')
      .populate('cycleId')
      .populate('raisedByEmployeeId')
      .populate('assignedReviewerEmployeeId')
      .populate('resolvedByEmployeeId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  async findDisputeById(id: string): Promise<AppraisalDisputeDocument> {
    // Ensure ID is valid ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid dispute ID format: ${id}`);
    }
    
    const dispute = await this.appraisalDisputeModel
      .findById(new Types.ObjectId(id))
      .populate('appraisalId')
      .populate('raisedByEmployeeId')
      .populate('assignedReviewerEmployeeId')
      .populate('resolvedByEmployeeId')
      .exec();
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }
    return dispute;
  }

  async resolveDispute(
    disputeId: string,
    dto: ResolveDisputeDto,
    hrManagerId: string,
    action: 'approve' | 'reject',
  ): Promise<AppraisalDisputeDocument> {
    const dispute = await this.findDisputeById(disputeId);

    if (dispute.status !== AppraisalDisputeStatus.OPEN && dispute.status !== AppraisalDisputeStatus.UNDER_REVIEW) {
      throw new BadRequestException('Dispute is not in a resolvable state');
    }

    // Helper function to safely extract ID string
    const getIdString = (value: any): string => {
      if (!value) return '';
      if (value instanceof Types.ObjectId) return value.toString();
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const obj = value as any;
        if ('_id' in obj) {
          return obj._id instanceof Types.ObjectId ? obj._id.toString() : String(obj._id);
        }
      }
      return String(value);
    };

    if (action === 'approve') {
      dispute.status = AppraisalDisputeStatus.ADJUSTED;
      
      // Update the appraisal record if adjusted score/rating provided
      if (dto.adjustedScore !== undefined || dto.adjustedRatingLabel) {
        const appraisalIdValue = getIdString(dispute.appraisalId);
        const record = await this.findAppraisalRecordById(appraisalIdValue);
        if (dto.adjustedScore !== undefined) {
          record.totalScore = dto.adjustedScore;
        }
        if (dto.adjustedRatingLabel) {
          record.overallRatingLabel = dto.adjustedRatingLabel;
        }
        await record.save();

        // Update employee profile with new score
        const employeeIdValue = getIdString(record.employeeProfileId);
        const employee = await this.employeeProfileModel.findById(employeeIdValue).exec();
        if (employee) {
          employee.lastAppraisalScore = record.totalScore;
          employee.lastAppraisalRatingLabel = record.overallRatingLabel;
          await employee.save();
        }
      }
    } else {
      dispute.status = AppraisalDisputeStatus.REJECTED;
    }

    dispute.resolutionSummary = dto.resolutionSummary;
    dispute.resolvedAt = new Date();
    dispute.resolvedByEmployeeId = new Types.ObjectId(hrManagerId);

    return dispute.save();
  }

  // ========== DASHBOARD/MONITORING METHODS ==========

  async getAssignmentsByCycle(cycleId: string): Promise<AppraisalAssignmentDocument[]> {
    return this.appraisalAssignmentModel
      .find({ cycleId: new Types.ObjectId(cycleId) })
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .populate('managerProfileId', 'firstName lastName')
      .populate('templateId', 'name')
      .populate({
        path: 'departmentId',
        select: 'name code',
        // This will return null if departmentId is invalid or doesn't exist
        strictPopulate: false
      })
      .exec();
  }

  async getPendingAssignmentsForReminders(cycleId?: string): Promise<AppraisalAssignmentDocument[]> {
    const query: any = {
      status: { $in: [AppraisalAssignmentStatus.NOT_STARTED, AppraisalAssignmentStatus.IN_PROGRESS] },
    };
    if (cycleId) {
      query.cycleId = new Types.ObjectId(cycleId);
    }
    return this.appraisalAssignmentModel
      .find(query)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();
  }

  async getPublishedAppraisalsForEmployee(employeeId: string): Promise<AppraisalRecordDocument[]> {
    return this.appraisalRecordModel
      .find({
        employeeProfileId: new Types.ObjectId(employeeId),
        status: AppraisalRecordStatus.HR_PUBLISHED,
      })
      .populate('cycleId')
      .populate('templateId')
      .populate('managerProfileId')
      .sort({ hrPublishedAt: -1 })
      .exec();
  }

  async getAppraisalProgressByDepartment(departmentId: string): Promise<any> {
    const assignments = await this.appraisalAssignmentModel
      .find({ departmentId: new Types.ObjectId(departmentId) })
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .exec();

    const total = assignments.length;
    const submitted = assignments.filter(a => a.status === AppraisalAssignmentStatus.SUBMITTED).length;
    const published = assignments.filter(a => a.status === AppraisalAssignmentStatus.PUBLISHED).length;
    const acknowledged = assignments.filter(a => a.status === AppraisalAssignmentStatus.ACKNOWLEDGED).length;

    return {
      departmentId,
      total,
      notStarted: assignments.filter(a => a.status === AppraisalAssignmentStatus.NOT_STARTED).length,
      inProgress: assignments.filter(a => a.status === AppraisalAssignmentStatus.IN_PROGRESS).length,
      submitted,
      published,
      acknowledged,
      completionRate: total > 0 ? (published / total) * 100 : 0,
    };
  }
}
