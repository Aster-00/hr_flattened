// src/leaves/requests/requests.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LeaveRequest } from '../Models/leave-request.schema';
import { LeaveType } from '../Models/leave-type.schema';
import { LeavePolicy } from '../Models/leave-policy.schema';
import { LeaveEntitlement } from '../Models/leave-entitlement.schema';
import { Calendar } from '../Models/calendar.schema';
import { Holiday } from '../../time-management/Models/holiday.schema';
import { LeaveAdjustment } from '../Models/leave-adjustment.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { FinalizeRequestDto } from './dto/finalize-request.dto';
import { LeaveStatus } from '../enums/leave-status.enum';
import { AdjustmentType } from '../enums/adjustment-type.enum';
import { AttachmentType } from '../enums/attachment-type.enum';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { CalendarsService } from '../calendars/calendars.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReturnForCorrectionDto } from './dto/return-for-correction.dto';
/**
 * Hard-coded post-leave grace period in days.
 * In future this can be moved to config or a settings collection.
 */
const MAX_POST_LEAVE_DAYS = 7;

/**
 * RequestsService
 *
 * Handles the lifecycle of leave requests:
 *  - Submission with policy / entitlement / calendar validation
 *  - Overlap checks, attachment rules, post-leave grace
 *  - Employee modifications and cancellations
 *  - Manager approvals / rejections
 *  - HR finalization / override
 *  - Balance updates + LeaveAdjustment audit
 *  - Notifications to managers and employees
 */
@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveType.name)
    private readonly leaveTypeModel: Model<LeaveType>,
    @InjectModel(LeavePolicy.name)
    private readonly leavePolicyModel: Model<LeavePolicy>,
    @InjectModel(LeaveEntitlement.name)
    private readonly leaveEntitlementModel: Model<LeaveEntitlement>,
    @InjectModel(Calendar.name)
    private readonly calendarModel: Model<Calendar>,
    @InjectModel(Holiday.name)
    private readonly holidayModel: Model<Holiday>,
    @InjectModel(LeaveAdjustment.name)
    private readonly leaveAdjustmentModel: Model<LeaveAdjustment>,
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly calendarsService: CalendarsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * REQ-015/016/031
   * Submit a new leave request with:
   *  - Employee, type, policy validation
   *  - Eligibility checks
   *  - Calendar working-days calculation
   *  - Overlap checks vs existing APPROVED + PENDING requests
   *  - Attachment requirement validation (generic + medical)
   *  - Entitlement check using yearlyEntitlement + carryForward - taken - pending
   *  - Post-leave grace (7 days)
   *  - Real-time pending balance increment
   */
  async submitRequest(dto: CreateRequestDto) {
    const {
      employeeId,
      leaveTypeId,
      fromDate,
      toDate,
      durationDays,
      justification,
      attachmentId,
      isPostLeave,
    } = dto;

    // Ensure employeeId is provided (should be set by controller from JWT)
    if (!employeeId) {
      throw new BadRequestException('employeeId is required');
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from) {
      throw new BadRequestException('toDate must be after fromDate');
    }

    console.log('🔍 [submitRequest] Validating employee:', { employeeId });

    const employeeObjectId = new Types.ObjectId(employeeId);
    const leaveTypeObjectId = new Types.ObjectId(leaveTypeId);
    const attachmentObjectId = attachmentId
      ? new Types.ObjectId(attachmentId)
      : undefined;

    // 1) Validate employee exists & get profile (direct lookup, no access control needed here)
    // ✅ AFTER - Since this is internal validation, pass a system user object
const employee = await this.employeeProfileService.getEmployeeById(
  employeeObjectId.toString(),
  { roles: [SystemRole.SYSTEM_ADMIN] } // Bypass access control for internal validation
) as any;
    console.log('🔍 [submitRequest] Employee lookup result:', { 
      found: !!employee, 
      employeeId: employee?._id,
      email: employee?.workEmail 
    });

    if (!employee) {
      throw new BadRequestException(`Employee does not exist. ID: ${employeeId}`);
    }

    const employeeContractType = employee.contractType;
    const employeePosition = employee.position || employee.jobTitle;
    const employeeHireDate = new Date(
      employee.hireDate || employee.workReceivingDate,
    );
    const employeeCalendarId = employee.calendarId;
    const managerId = employee.managerId;

    // 2) Validate leave type + policy
    const leaveType = await this.leaveTypeModel
      .findById(leaveTypeObjectId)
      .lean()
      .exec();
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const leavePolicy = await this.leavePolicyModel
      .findOne({ leaveTypeId: leaveTypeObjectId })
      .lean()
      .exec();
    if (!leavePolicy) {
      throw new BadRequestException(
        'No policy configured for this leave type',
      );
    }

    // 3) Eligibility check
    const now = new Date();
    const tenureInMonths =
      (now.getFullYear() - employeeHireDate.getFullYear()) * 12 +
      (now.getMonth() - employeeHireDate.getMonth());

    const eligibility = (leavePolicy as any).eligibility || {};
    const minTenureMonths = eligibility.minTenureMonths as number | undefined;
    const positionsAllowed = eligibility.positionsAllowed as string[] | undefined;
    const contractTypesAllowed = eligibility.contractTypesAllowed as string[] | undefined;

    if (minTenureMonths && tenureInMonths < minTenureMonths) {
      throw new BadRequestException(
        'Employee does not meet minimum tenure for this leave',
      );
    }

    if (
      contractTypesAllowed &&
      contractTypesAllowed.length > 0 &&
      employeeContractType &&
      !contractTypesAllowed.includes(employeeContractType)
    ) {
      throw new BadRequestException(
        'Employee contract type not eligible for this leave',
      );
    }

    if (
      positionsAllowed &&
      positionsAllowed.length > 0 &&
      employeePosition &&
      !positionsAllowed.includes(employeePosition)
    ) {
      throw new BadRequestException(
        'Employee position not eligible for this leave',
      );
    }

    // 4) Calendar & holidays
    let effectiveDuration = durationDays;

    if (employeeCalendarId) {
      const analysis =
        await this.calendarsService.analyzeDateRangeForEmployee(
          employeeCalendarId.toString(),
          from,
          to,
        );

      effectiveDuration = analysis.workingDays;

      if (analysis.overlapsBlockedPeriod) {
        throw new BadRequestException(
          'Requested dates fall within a blocked period',
        );
      }
    }

    if (effectiveDuration <= 0) {
      throw new BadRequestException(
        'Calculated duration must be positive after calendar rules',
      );
    }

    // 5) Overlap check vs existing APPROVED + PENDING requests
    const overlapping = await this.leaveRequestModel
      .findOne({
        employeeId: employeeObjectId,
        status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
        'dates.from': { $lte: to },
        'dates.to': { $gte: from },
      })
      .lean()
      .exec();

    if (overlapping) {
      throw new BadRequestException(
        'Requested dates overlap with an existing leave request',
      );
    }

    // 6) Attachment requirement validation (generic + medical rules)
    if (leaveType.requiresAttachment && !attachmentObjectId) {
      throw new BadRequestException(
        'This leave type requires an attachment',
      );
    }

    if (
      !attachmentObjectId &&
      leaveType.attachmentType === AttachmentType.MEDICAL &&
      effectiveDuration > 1
    ) {
      throw new BadRequestException(
        'Medical leave longer than 1 day requires a medical certificate attachment',
      );
    }

    // 7) Entitlement check using NEW schema fields
    console.log('🔍 [submitRequest] Checking entitlement:', { 
      employeeId: employeeObjectId.toString(), 
      leaveTypeId: leaveTypeObjectId.toString() 
    });
    
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: employeeObjectId,
      leaveTypeId: leaveTypeObjectId,
    });

    console.log('🔍 [submitRequest] Entitlement found:', !!entitlement);

    if (!entitlement) {
      // Check if any entitlements exist for this employee
      const allEntitlements = await this.leaveEntitlementModel.find({ employeeId: employeeObjectId }).lean();
      console.log('🔍 [submitRequest] All entitlements for employee:', allEntitlements.length);
      if (allEntitlements.length > 0) {
        console.log('🔍 [submitRequest] Sample entitlement:', JSON.stringify(allEntitlements[0], null, 2));
      }
      
      // Check if any entitlements exist for this leave type
      const typeEntitlements = await this.leaveEntitlementModel.find({ leaveTypeId: leaveTypeObjectId }).lean();
      console.log('🔍 [submitRequest] All entitlements for leave type:', typeEntitlements.length);
      
      throw new BadRequestException(
        `No entitlement found for this employee and leave type. Employee: ${employeeObjectId}, LeaveType: ${leaveTypeObjectId}`,
      );
    }

    // Calculate available balance from yearlyEntitlement + carryForward - taken - pending
    const totalEntitlement =
      (entitlement.yearlyEntitlement ?? 0) +
      (entitlement.carryForward ?? 0);
    const consumed =
      (entitlement.taken ?? 0) +
      (entitlement.pending ?? 0);
    const availableBefore = totalEntitlement - consumed;

    if (effectiveDuration > availableBefore) {
      throw new BadRequestException(
        `Requested duration (${effectiveDuration} days) exceeds available entitlement (${availableBefore} days)`,
      );
    }

    // 8) Post-leave grace check (7 days)
    if (isPostLeave) {
      const latestAllowed = new Date(to);
      latestAllowed.setDate(latestAllowed.getDate() + MAX_POST_LEAVE_DAYS);
      if (now > latestAllowed) {
        throw new BadRequestException(
          `Post-leave request must be submitted within ${MAX_POST_LEAVE_DAYS} days after leave end date`,
        );
      }
    }

    // 9) Persist request
    const leaveRequest = new this.leaveRequestModel({
      employeeId: employeeObjectId,
      leaveTypeId: leaveTypeObjectId,
      dates: { from, to },
      durationDays: effectiveDuration,
      justification,
      attachmentId: attachmentObjectId,
      approvalFlow: [],
      status: LeaveStatus.PENDING,
      irregularPatternFlag: false,
    });

    // 10) Real-time pending balance increment and recalculate remaining
    entitlement.pending = (entitlement.pending ?? 0) + effectiveDuration;
    entitlement.remaining =
      (entitlement.yearlyEntitlement ?? 0) +
      (entitlement.carryForward ?? 0) -
      (entitlement.taken ?? 0) -
      entitlement.pending;

    await entitlement.save();

    const saved = await leaveRequest.save();

    // 11) Notification to manager
    if (managerId) {
      await this.notificationsService.emitForUser(
        managerId.toString(),
        'New leave request',
        `New leave request from ${
          employee.fullName || employee.employeeNumber || 'employee'
        }`,
        { requestId: saved._id.toString() },
      );
    }

    return saved;
  }
  async isEmployeeOnLeaveOnDate(
    employeeId: string,
    dateInput: string | Date,
    includePending = false,
  ) {
    const date =
      dateInput instanceof Date ? dateInput : new Date(dateInput);

    const statuses = includePending
      ? [LeaveStatus.APPROVED, LeaveStatus.PENDING]
      : [LeaveStatus.APPROVED];

    const request = await this.leaveRequestModel
      .findOne({
        employeeId: new Types.ObjectId(employeeId),
        status: { $in: statuses },
        'dates.from': { $lte: date },
        'dates.to': { $gte: date },
      })
      .lean()
      .exec();

    return {
      isOnLeave: !!request,
      requestId: request?._id?.toString() ?? null,
      status: request?.status ?? null,
      fromDate: request?.dates?.from ?? null,
      toDate: request?.dates?.to ?? null,
    };
  }

  /**
   * Get employee leave requests within a date range (for calendar display)
   * Used by recruitment module to show panel member availability
   */
  async getEmployeeLeaveRequestsInRange(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const employeeObjectId = new Types.ObjectId(employeeId);

    const requests = await this.leaveRequestModel
      .find({
        employeeId: employeeObjectId,
        status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
        $or: [
          // Leave starts within range
          { 'dates.from': { $gte: startDate, $lte: endDate } },
          // Leave ends within range
          { 'dates.to': { $gte: startDate, $lte: endDate } },
          // Leave spans entire range
          { 'dates.from': { $lte: startDate }, 'dates.to': { $gte: endDate } },
        ],
      })
      .populate('leaveTypeId', 'name code color')
      .lean()
      .exec();

    return requests;
  }

  /**
   * REQ-017
   * Employee modifies own pending request
   * - Adjusts entitlement.pending based on duration delta
   * - Recalculates remaining
   */
  async updateRequestAsOwner(
    id: string,
    dto: UpdateRequestDto,
    userId: string,
  ) {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (String(request.employeeId) !== String(userId)) {
      throw new ForbiddenException('You can only modify your own requests');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be modified',
      );
    }

    const oldDuration = request.durationDays;
    const oldFrom = request.dates.from;
    const oldTo = request.dates.to;

    if (dto.fromDate) {
      request.dates.from = new Date(dto.fromDate);
    }

    if (dto.toDate) {
      request.dates.to = new Date(dto.toDate);
    }

    if (dto.durationDays !== undefined) {
      if (dto.durationDays <= 0) {
        throw new BadRequestException('durationDays must be positive');
      }
      request.durationDays = dto.durationDays;
    }

    if (dto.justification !== undefined) {
      request.justification = dto.justification;
    }

    if (dto.attachmentId) {
      request.attachmentId = new Types.ObjectId(dto.attachmentId);
    }

    const from = request.dates.from;
    const to = request.dates.to;
    if (to < from) {
      throw new BadRequestException('toDate must be after fromDate');
    }

    // Overlap check on update
    const overlapping = await this.leaveRequestModel
      .findOne({
        _id: { $ne: request._id },
        employeeId: request.employeeId,
        status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
        'dates.from': { $lte: to },
        'dates.to': { $gte: from },
      })
      .lean()
      .exec();

    if (overlapping) {
      request.dates.from = oldFrom;
      request.dates.to = oldTo;
      throw new BadRequestException(
        'Updated dates overlap with an existing leave request',
      );
    }

    const newDuration = request.durationDays;
    const delta = newDuration - oldDuration;

    // Adjust entitlement.pending if duration changed
    if (delta !== 0) {
      const entitlement = await this.leaveEntitlementModel.findOne({
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
      });

      if (!entitlement) {
        throw new BadRequestException(
          'No entitlement found for this employee and leave type',
        );
      }

      const newPending = (entitlement.pending ?? 0) + delta;
      if (newPending < 0) {
        throw new BadRequestException(
          'Update would result in negative pending balance',
        );
      }

      entitlement.pending = newPending;
      entitlement.remaining =
        (entitlement.yearlyEntitlement ?? 0) +
        (entitlement.carryForward ?? 0) -
        (entitlement.taken ?? 0) -
        entitlement.pending;

      await entitlement.save();
    }

    const saved = await request.save();
    return saved;
  }

  /**
   * REQ-018
   * Employee cancels own pending/approved request
   * - If pending: decrease entitlement.pending
   * - If approved: reverse taken and add an ADD adjustment
   * - Recalculate remaining
   */
  async cancelRequest(id: string, employeeId: string) {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.employeeId.toString() !== employeeId.toString()) {
      throw new ForbiddenException(
        'You can only cancel your own requests',
      );
    }

    if (
      request.status !== LeaveStatus.PENDING &&
      request.status !== LeaveStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Only pending or approved requests can be cancelled',
      );
    }

    const originalStatus = request.status;
    const days = request.durationDays;

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (!entitlement) {
      throw new BadRequestException(
        'No entitlement found for employee and leave type',
      );
    }

    if (originalStatus === LeaveStatus.PENDING) {
      // Reverse only pending
      entitlement.pending = Math.max(
        (entitlement.pending ?? 0) - days,
        0,
      );
    } else if (originalStatus === LeaveStatus.APPROVED) {
      // Reverse taken; pending already reduced on approval
      const currentTaken = entitlement.taken ?? 0;
      entitlement.taken = Math.max(currentTaken - days, 0);

      // Log reversal adjustment (ADD)
      const adjustment = new this.leaveAdjustmentModel({
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
        adjustmentType: AdjustmentType.ADD,
        amount: days,
        reason: `Cancel approved leave request ${request._id.toString()}`,
        /**
         * TODO: hrUserId should ideally reflect the HR/system account.
         * For now, cancellation is employee-driven; system user or nullable would be better.
         */
        hrUserId: new Types.ObjectId(),
      });
      await adjustment.save();
    }

    // Recalculate remaining
    entitlement.remaining =
      (entitlement.yearlyEntitlement ?? 0) +
      (entitlement.carryForward ?? 0) -
      (entitlement.taken ?? 0) -
      (entitlement.pending ?? 0);

    await entitlement.save();

    request.status = LeaveStatus.CANCELLED;
    const saved = await request.save();

    // Notify manager about cancellation
    try {
      const employee = await this.employeeProfileService.getEmployeeById(
  request.employeeId.toString(),
  { roles: [SystemRole.SYSTEM_ADMIN] }
) as any;
      const managerId = employee?.managerId;

      if (managerId) {
        await this.notificationsService.emitForUser(
          managerId.toString(),
          'Leave request cancelled',
          `Leave request for employee ${
            employee.fullName || employee.employeeNumber || 'employee'
          } has been cancelled.`,
          { requestId: saved._id.toString() },
        );
      }
    } catch {
      // Swallow notification errors
    }

    return saved;
  }

  /**
   * Helper: fetches a request or throws 404
   */
  private async getRequestOrThrow(
    id: string,
  ): Promise<HydratedDocument<LeaveRequest>> {
    const request = await this.leaveRequestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    return request;
  }

  /**
   * Helper: validate that approver is an allowed manager/head for the employee
   */
  private async validateManagerForRequest(
    request: HydratedDocument<LeaveRequest>,
    approverId: string,
  ) {
    const employeeId = request.employeeId.toString();

    console.log('🔍 [validateManagerForRequest] ==================== START ====================');
    console.log('🔍 [validateManagerForRequest] Input approverId:', approverId);
    console.log('🔍 [validateManagerForRequest] Request employeeId:', employeeId);

    const [employee, approver] = await Promise.all([
  this.employeeProfileService.getEmployeeById(employeeId, { roles: [SystemRole.SYSTEM_ADMIN] }) as any,
  this.employeeProfileService.getEmployeeById(approverId, { roles: [SystemRole.SYSTEM_ADMIN] }) as any,
]);

    console.log('🔍 [validateManagerForRequest] Employee object exists?', !!employee);
    console.log('🔍 [validateManagerForRequest] Approver object exists?', !!approver);

    if (approver) {
      console.log('🔍 [validateManagerForRequest] Approver full object:', JSON.stringify({
        _id: approver._id,
        workEmail: approver.workEmail,
        firstName: approver.firstName,
        lastName: approver.lastName,
        roles: approver.roles,
        primaryDepartmentId: approver.primaryDepartmentId,
      }, null, 2));
    } else {
      console.log('❌ [validateManagerForRequest] Approver is NULL or undefined!');
    }

    if (!employee || !approver) {
      throw new BadRequestException('Employee or approver not found');
    }

    const approverRoles: SystemRole[] = approver.roles ?? [];

    console.log('🔍 [validateManagerForRequest] Approver roles:', JSON.stringify(approverRoles));
    console.log('🔍 [validateManagerForRequest] Approver roles length:', approverRoles.length);
    console.log('🔍 [validateManagerForRequest] SystemRole.HR_MANAGER =', SystemRole.HR_MANAGER);
    console.log('🔍 [validateManagerForRequest] SystemRole.HR_ADMIN =', SystemRole.HR_ADMIN);
    console.log('🔍 [validateManagerForRequest] Employee dept:', employee.primaryDepartmentId);
    console.log('🔍 [validateManagerForRequest] Approver dept:', approver.primaryDepartmentId);

    // ✅ HR Managers, HR Admins, and System Admins can approve ANY employee's leave
    // Check both exact match, case-insensitive match, and partial string matching
    const isHRRole =
      approverRoles.includes(SystemRole.HR_MANAGER) ||
      approverRoles.includes(SystemRole.HR_ADMIN) ||
      approverRoles.includes(SystemRole.SYSTEM_ADMIN) ||
      approverRoles.some(role => role?.toLowerCase().trim() === 'hr manager') ||
      approverRoles.some(role => role?.toLowerCase().trim() === 'hr admin') ||
      approverRoles.some(role => role?.toLowerCase().trim() === 'system admin') ||
      // Fallback: check if role contains "hr" and ("manager" or "admin")
      approverRoles.some(role => {
        const lowerRole = role?.toLowerCase().trim() || '';
        return lowerRole.includes('hr') && (lowerRole.includes('manager') || lowerRole.includes('admin'));
      });

    console.log('🔍 [validateManagerForRequest] Is HR Role?', isHRRole);

    if (isHRRole) {
      console.log('✅ [validateManagerForRequest] HR role detected - bypassing department check');
      return; // HR roles bypass department check
    }

    // ✅ Department Heads can only approve within their department
    const isDepartmentHead = approverRoles.includes(SystemRole.DEPARTMENT_HEAD);

    const sameDept =
      employee.primaryDepartmentId &&
      approver.primaryDepartmentId &&
      employee.primaryDepartmentId.toString() ===
        approver.primaryDepartmentId.toString();

    if (!isDepartmentHead || !sameDept) {
      throw new ForbiddenException(
        'Approver is not allowed to approve this employees leave',
      );
    }
  }

  /**
   * REQ-020/021
   * Manager approve (single-level in v1)
   */
  async managerApprove(id: string, dto: ApproveRequestDto) {
    const { approverId, comment } = dto;

    if (!approverId) {
      throw new BadRequestException('approverId is required');
    }

    const request = await this.getRequestOrThrow(id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be approved',
      );
    }

    await this.validateManagerForRequest(request, approverId);

    request.approvalFlow.push({
      role: 'MANAGER',
      status: 'approved',
      decidedBy: new Types.ObjectId(approverId),
      decidedAt: new Date(),
      comment,
    } as any);

    request.status = LeaveStatus.APPROVED;

    const saved = await request.save();

    // Notify employee
    await this.notificationsService.emitForUser(
      request.employeeId.toString(),
      'Leave request approved by manager',
      'Your leave request has been approved by your manager.',
      { requestId: saved._id.toString() },
    );

    return saved;
  }

  /**
   * REQ-020/022
   * Manager reject
   */
  async managerReject(id: string, dto: ApproveRequestDto) {
    const { approverId, comment } = dto;

    if (!approverId) {
      throw new BadRequestException('approverId is required');
    }

    const request = await this.getRequestOrThrow(id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be rejected',
      );
    }

    await this.validateManagerForRequest(request, approverId);

    request.approvalFlow.push({
      role: 'MANAGER',
      status: 'rejected',
      decidedBy: new Types.ObjectId(approverId),
      decidedAt: new Date(),
      comment,
    } as any);

    request.status = LeaveStatus.REJECTED;

    const saved = await request.save();

    // Notify employee
    await this.notificationsService.emitForUser(
      request.employeeId.toString(),
      'Leave request rejected by manager',
      'Your leave request has been rejected by your manager.',
      { requestId: saved._id.toString() },
    );

    return saved;
  }
    /**
   * REQ-024
   * Manager/HR returns request to employee for correction.
   * Constraint: Cannot change schema or status enum, so:
   * - Keep status = 'pending'
   * - Record a 'returned' step in approvalFlow
   * - Enforce behavior via business rules in manager/HR methods.
   */
  async returnForCorrection(id: string, dto: ReturnForCorrectionDto) {
    const { returnerId, reason, comment } = dto;

    const request = await this.getRequestOrThrow(id);

    // Only pending requests can be returned
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be returned for correction',
      );
    }

    // Validate that returner is a valid manager/head for this employee
    await this.validateManagerForRequest(request, returnerId);

    // Append to approvalFlow but keep overall status as pending
    request.approvalFlow.push({
      role: 'MANAGER',
      status: 'returned',
      decidedBy: new Types.ObjectId(returnerId),
      decidedAt: new Date(),
      // comment field exists in code, but schema doesn’t enforce it; still safe to set
      comment: comment || reason,
    } as any);

    const saved = await request.save();

    // Notify employee
    await this.notificationsService.emitForUser(
      request.employeeId.toString(),
      'Leave request returned for correction',
      `Your leave request was returned for correction. Reason: ${reason}`,
      {
        requestId: saved._id.toString(),
        reason,
      },
    );

    return saved;
  }

  /**
   * REQ-024
   * Employee resubmits after corrections.
   * Still no schema/enum change:
   * - status stays 'pending'
   * - add a 'resubmitted' step in approvalFlow
   */
  async resubmitReturnedRequest(id: string, employeeId: string) {
    const request = await this.getRequestOrThrow(id);

    if (request.employeeId.toString() !== employeeId.toString()) {
      throw new ForbiddenException('You can only resubmit your own requests');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be resubmitted',
      );
    }

    // Check that it was actually returned before (at least one 'returned' step)
    const wasReturned = request.approvalFlow.some(
      (step) => step.status === 'returned',
    );

    if (!wasReturned) {
      throw new BadRequestException(
        'This request has not been returned for correction',
      );
    }

    request.approvalFlow.push({
      role: 'EMPLOYEE',
      status: 'resubmitted',
      decidedBy: new Types.ObjectId(employeeId),
      decidedAt: new Date(),
    } as any);

    const saved = await request.save();

    // Notify manager again
    try {
      const employee = await this.employeeProfileService.getEmployeeById(
  request.employeeId.toString(),
  { roles: [SystemRole.SYSTEM_ADMIN] }
) as any;
      const managerId = employee?.managerId;

      if (managerId) {
        await this.notificationsService.emitForUser(
          managerId.toString(),
          'Leave request resubmitted',
          `Employee ${
            employee.fullName || employee.employeeNumber || 'employee'
          } has resubmitted a leave request after corrections.`,
          { requestId: saved._id.toString() },
        );
      }
    } catch {
      // Do not block resubmission on notification failure
    }

    return saved;
  }


  /**
   * REQ-025/029/030/042
   * HR finalize (after manager approval) and apply balance updates
   */
  /**
 * REQ-025/029/030/042
 * HR finalize (after manager approval) and apply balance updates
 */
async hrFinalize(id: string, dto: FinalizeRequestDto) {
  const { hrUserId, comment } = dto;
  const request = await this.getRequestOrThrow(id);

  if (request.status !== LeaveStatus.APPROVED) {
    throw new BadRequestException(
      'Only manager-approved requests can be finalized by HR',
    );
  }

  request.approvalFlow.push({
    role: 'HR',
    status: 'approved',
    decidedBy: new Types.ObjectId(hrUserId),
    decidedAt: new Date(),
    comment,
  } as any);

  await this.applyFinalBalanceUpdate(request, hrUserId);

  const saved = await request.save();

  // Fetch employee details once for notifications
  const employee = await this.employeeProfileService['empModel']
    .findById(request.employeeId)
    .lean()
    .exec() as any;

  const employeeName = employee?.fullName || employee?.employeeNumber || 'employee';
  const managerId = employee?.managerId;

  // 1) Notify employee
  await this.notificationsService.emitForUser(
    request.employeeId.toString(),
    'Leave request finalized',
    'Your leave request has been finalized by HR.',
    { requestId: saved._id.toString() },
  );

  // 2) Notify manager
  if (managerId) {
    try {
      await this.notificationsService.emitForUser(
        managerId.toString(),
        'Leave request finalized for your team member',
        `Leave request for employee ${employeeName} has been finalized by HR.`,
        { requestId: saved._id.toString() },
      );
    } catch {
      // Notification failures should not break finalize
    }
  }

  // 3) Notify all HR Admins (acting as Attendance Coordinators per REQ-030)
  try {
    // Query all users with HR_ADMIN role
    const hrAdmins = await this.employeeProfileService.findByRole(
      SystemRole.HR_ADMIN,
    );

    for (const hrAdmin of hrAdmins) {
      // Skip notifying the HR user who performed the finalization
      if (hrAdmin._id.toString() === hrUserId) {
        continue;
      }

      await this.notificationsService.emitForUser(
        hrAdmin._id.toString(),
        'Leave finalized - attendance update required',
        `Leave for employee ${employeeName} (${request.durationDays} days) has been finalized and requires attendance coordination.`,
        { 
          requestId: saved._id.toString(),
          employeeId: request.employeeId.toString(),
          fromDate: request.dates.from,
          toDate: request.dates.to,
          durationDays: request.durationDays,
        },
      );
    }
  } catch (err) {
    // Log error but don't block finalize if HR Admin query fails
    console.error('Failed to notify HR Admins (Attendance Coordinators):', err);
  }

  return saved;
}

 /**
 * REQ-026
 * HR override manager decision
 */
async hrOverride(id: string, dto: FinalizeRequestDto) {
  const { hrUserId, comment } = dto;
  const request = await this.getRequestOrThrow(id);

  if (
    request.status !== LeaveStatus.APPROVED &&
    request.status !== LeaveStatus.REJECTED
  ) {
    throw new BadRequestException(
      'HR can override only after manager decision',
    );
  }

  request.approvalFlow.push({
    role: 'HR',
    status: 'override_approved',
    decidedBy: new Types.ObjectId(hrUserId),
    decidedAt: new Date(),
    comment,
  } as any);

  request.status = LeaveStatus.APPROVED;

  await this.applyFinalBalanceUpdate(request, hrUserId);

  const saved = await request.save();

  // Fetch employee details once for notifications
  const employee = await this.employeeProfileService.getEmployeeById(
  request.employeeId.toString(),
  { roles: [SystemRole.SYSTEM_ADMIN] }
) as any;

  const employeeName = employee?.fullName || employee?.employeeNumber || 'employee';
  const managerId = employee?.managerId;

  // 1) Notify employee
  await this.notificationsService.emitForUser(
    request.employeeId.toString(),
    'Leave request overridden by HR',
    'HR has overridden your managers decision and approved your leave.',
    { requestId: saved._id.toString() },
  );

  // 2) Notify manager about override decision
  if (managerId) {
    try {
      await this.notificationsService.emitForUser(
        managerId.toString(),
        'HR has overridden your leave decision',
        `HR has overridden your decision and approved leave for employee ${employeeName}.`,
        { requestId: saved._id.toString() },
      );
    } catch {
      // Do not block override on notification failure
    }
  }

  // 3) Notify all HR Admins (acting as Attendance Coordinators)
  try {
    const hrAdmins = await this.employeeProfileService.findByRole(
      SystemRole.HR_ADMIN,
    );

    for (const hrAdmin of hrAdmins) {
      // Skip notifying the HR user who performed the override
      if (hrAdmin._id.toString() === hrUserId) {
        continue;
      }

      await this.notificationsService.emitForUser(
        hrAdmin._id.toString(),
        'Leave overridden - attendance update required',
        `Leave for employee ${employeeName} (${request.durationDays} days) has been overridden and approved. Attendance coordination required.`,
        { 
          requestId: saved._id.toString(),
          employeeId: request.employeeId.toString(),
          fromDate: request.dates.from,
          toDate: request.dates.to,
          durationDays: request.durationDays,
        },
      );
    }
  } catch (err) {
    console.error('Failed to notify HR Admins (Attendance Coordinators):', err);
  }

  return saved;
}


  /**
   * REQ-027
   * Bulk manager approve/reject
   */
  async bulkProcessRequests(
    requestIds: string[],
    action: 'approve' | 'reject',
    approverId: string,
  ) {
    const results: HydratedDocument<LeaveRequest>[] = [];

    for (const id of requestIds) {
      if (action === 'approve') {
        results.push(
          (await this.managerApprove(id, { approverId })) as any,
        );
      } else {
        results.push(
          (await this.managerReject(id, { approverId })) as any,
        );
      }
    }

    return { count: results.length, results };
  }

  /**
   * REQ-029
   * Final balance update after approved leave
   * - Deducts from entitlement using new schema fields
   * - Recalculates remaining = (yearlyEntitlement + carryForward) - taken - pending
   * - Creates a DEDUCT LeaveAdjustment
   */
  private async applyFinalBalanceUpdate(
    request: HydratedDocument<LeaveRequest>,
    hrUserId: string,
  ) {
    const employeeId = request.employeeId;
    const leaveTypeId = request.leaveTypeId;
    const days = request.durationDays;

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new BadRequestException(
        'No entitlement found for employee and leave type',
      );
    }

    // Update taken and pending
    entitlement.taken = (entitlement.taken ?? 0) + days;
    entitlement.pending = Math.max(
      (entitlement.pending ?? 0) - days,
      0,
    );

    // Recalculate remaining using yearlyEntitlement + carryForward
    entitlement.remaining =
      (entitlement.yearlyEntitlement ?? 0) +
      (entitlement.carryForward ?? 0) -
      entitlement.taken -
      entitlement.pending;

    await entitlement.save();

    // Create DEDUCT adjustment
    const adjustment = new this.leaveAdjustmentModel({
      employeeId,
      leaveTypeId,
      adjustmentType: AdjustmentType.DEDUCT,
      amount: days,
      reason: `Approved leave request ${request._id.toString()}`,
      hrUserId: new Types.ObjectId(hrUserId),
    });

    await adjustment.save();
  }
  /**
 * REQ-028
 * HR verifies medical documents logically (no persistent flag).
 * Returns whether the request:
 *  - exists
 *  - requires a medical attachment
 *  - has an attachment present
 */
async verifyMedicalDocuments(requestId: string) {
  const request = await this.leaveRequestModel
    .findById(requestId)
    .populate('leaveTypeId')
    .lean()
    .exec();

  if (!request) {
    throw new NotFoundException('Leave request not found');
  }

  const leaveType: any = request.leaveTypeId;

  const requiresMedical =
    leaveType?.attachmentType === AttachmentType.MEDICAL;

  const hasAttachment = !!request.attachmentId;

  const isCompliant = !requiresMedical || (requiresMedical && hasAttachment);

  return {
    requestId: request._id.toString(),
    leaveTypeId: leaveType?._id?.toString() ?? null,
    requiresMedical,
    hasAttachment,
    isCompliant,
  };
}
  /**
   * REQ-042
   * Get finalized leave details for integration (Payroll / Time Mgmt).
   */
  async getFinalizedLeaveDetails(id: string) {
    const request = await this.leaveRequestModel
      .findById(id)
      .populate('leaveTypeId')
      .lean()
      .exec();

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved (finalized) requests can be used for integration',
      );
    }

    const leaveType: any = request.leaveTypeId;

    return {
      requestId: request._id.toString(),
      employeeId: request.employeeId.toString(),
      leaveTypeId: leaveType?._id?.toString() ?? null,
      leaveTypeCode: leaveType?.code ?? null,
      fromDate: request.dates.from,
      toDate: request.dates.to,
      durationDays: request.durationDays,
      status: request.status,
    };
  }

  /**
   * Get all leave requests (HR only)
   * Returns all leave requests in the system with populated employee and leave type data
   */
  async findAll(filters?: any) {
  const query = filters || {};
  
  try {
    const requests = await this.leaveRequestModel
      .find(query)
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeNumber email primaryDepartmentId', // ✅ Added email
        options: { strictPopulate: false }
      })
      .populate({
        path: 'leaveTypeId',
        select: 'name code color icon',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'approverId',
        select: 'firstName lastName email',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'hrUserId',
        select: 'firstName lastName email',
        options: { strictPopulate: false }
      })
      .populate({ // ✅ ADD THIS - Populate approvers in approval flow
        path: 'approvalFlow.approverId',
        select: 'firstName lastName email',
        options: { strictPopulate: false }
      })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    console.log(`✅ [RequestsService] findAll: Retrieved ${requests.length} requests`);
    
    // ✅ ADD THIS - Log first request to verify population
    if (requests.length > 0) {
      console.log('🔍 [RequestsService] Sample request data:', {
        _id: requests[0]._id,
        employeeId: requests[0].employeeId,
        leaveTypeId: requests[0].leaveTypeId,
        hasApprovalFlow: !!requests[0].approvalFlow
      });
    }
    
    return requests;
  } catch (error) {
    console.error('❌ [RequestsService] findAll error:', error);
    throw new BadRequestException(`Failed to retrieve leave requests: ${error.message}`);
  }
}


  async getAllRequests() {
    console.log('🔍 [RequestsService] getAllRequests called');
    return this.findAll();
  }

  async findOne(id: string) {
    try {
      const request = await this.leaveRequestModel
        .findById(id)
        .populate({
          path: 'employeeId',
          select: 'firstName lastName employeeNumber primaryDepartmentId',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'leaveTypeId',
          select: 'name code color icon',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'approverId',
          select: 'firstName lastName',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'hrUserId',
          select: 'firstName lastName',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

      if (!request) {
        throw new NotFoundException('Leave request not found');
      }

      return request;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('❌ [RequestsService] findOne error:', error);
      throw new BadRequestException(`Failed to retrieve leave request: ${error.message}`);
    }
  }

  async update(id: string, dto: UpdateRequestDto) {
    const request = await this.getRequestOrThrow(id);
    
    // Only allow updating if status is PENDING or CANCELLED (can resubmit cancelled requests)
    if (request.status !== LeaveStatus.PENDING && request.status !== LeaveStatus.CANCELLED) {
      throw new BadRequestException('Cannot update request in current status');
    }

    Object.assign(request, dto);
    return request.save();
  }

  /**
   * REQ-006: Check for overlapping leave requests
   */
  async checkOverlappingRequests(
    employeeId: string,
    from: string,
    to: string,
    excludeId?: string,
  ) {
    const employeeObjectId = new Types.ObjectId(employeeId);
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const query: any = {
      employeeId: employeeObjectId,
      status: { $in: ['pending', 'approved', 'finalized'] },
      $or: [
        {
          'dates.from': { $lte: toDate },
          'dates.to': { $gte: fromDate },
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    try {
      const overlapping = await this.leaveRequestModel
        .find(query)
        .populate({
          path: 'leaveTypeId',
          select: 'name code color',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

      return {
        hasOverlap: overlapping.length > 0,
        overlappingRequests: overlapping.map((req: any) => ({
          _id: req._id,
          leaveType: req.leaveTypeId,
          dates: {
            from: req.dates.from,
            to: req.dates.to,
          },
          status: req.status,
          durationDays: req.durationDays,
        })),
      };
    } catch (error) {
      console.error('❌ [RequestsService] checkOverlappingRequests error:', error);
      // Return no overlap on error rather than crashing
      return {
        hasOverlap: false,
        overlappingRequests: [],
      };
    }
  }

  /**
   * Get employee's own requests
   * Returns all leave requests submitted by the authenticated employee
   */
  async getMyRequests(employeeId: string) {
    try {
      console.log(`🔍 [RequestsService] getMyRequests for employee: ${employeeId}`);
      const employeeObjectId = new Types.ObjectId(employeeId);

      const requests = await this.leaveRequestModel
        .find({ employeeId: employeeObjectId })
        .populate({
          path: 'leaveTypeId',
          select: 'name code color icon',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'approverId',
          select: 'firstName lastName',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'hrUserId',
          select: 'firstName lastName',
          options: { strictPopulate: false }
        })
        .sort({ submittedAt: -1 })
        .lean()
        .exec();

      console.log(`✅ [RequestsService] getMyRequests: Found ${requests.length} requests`);
      return requests;
    } catch (error) {
      console.error('❌ [RequestsService] getMyRequests error:', error);
      throw new BadRequestException(`Failed to retrieve your requests: ${error.message}`);
    }
  }

  /**
   * Get team requests (Manager only)
   * Returns leave requests for all employees reporting to the manager
   */
  async getTeamRequests(managerId: string) {
    try {
      console.log(`🔍 [RequestsService] getTeamRequests for manager: ${managerId}`);
      const managerObjectId = new Types.ObjectId(managerId);

      // Get the manager's employee profile to find their department
      const manager = await this.employeeProfileService.getEmployeeById(managerId, {
        roles: [SystemRole.HR_ADMIN],
      } as any);

      if (!manager) {
        console.error(`❌ [RequestsService] Manager not found: ${managerId}`);
        return [];
      }

      console.log(`🔍 [RequestsService] Manager details:`, {
        id: manager._id,
        name: `${manager.firstName} ${manager.lastName}`,
        primaryDepartmentId: manager.primaryDepartmentId
      });

      // Find all employees who report to this manager
      // Use getAllEmployees with a mock HR user to bypass role checks
      const allEmployees = await this.employeeProfileService.getAllEmployees({
        roles: [SystemRole.HR_ADMIN],
      } as any);

      // Filter team members by:
      // 1. Employees in the same department as the manager (most common case for department heads)
      // 2. Exclude the manager themselves
      const teamMembers = allEmployees.filter((emp: any) => {
        // Don't include the manager themselves
        if (emp._id.toString() === managerObjectId.toString()) {
          return false;
        }

        // Include if in same department as manager
        if (manager.primaryDepartmentId && emp.primaryDepartmentId) {
          return emp.primaryDepartmentId.toString() === manager.primaryDepartmentId.toString();
        }

        return false;
      });

      const teamMemberIds = teamMembers.map((emp: any) => emp._id);
      console.log(`✅ [RequestsService] Found ${teamMembers.length} team members in department ${manager.primaryDepartmentId} for manager ${manager.firstName} ${manager.lastName}`);

      const requests = await this.leaveRequestModel
        .find({ employeeId: { $in: teamMemberIds } })
        .populate({
          path: 'employeeId',
          select: 'firstName lastName employeeNumber primaryDepartmentId',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'leaveTypeId',
          select: 'name code color icon',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'approverId',
          select: 'firstName lastName',
          options: { strictPopulate: false }
        })
        .sort({ submittedAt: -1 })
        .lean()
        .exec();

      console.log(`✅ [RequestsService] getTeamRequests: Found ${requests.length} requests`);
      return requests;
    } catch (error) {
      console.error('❌ [RequestsService] getTeamRequests error:', error);
      throw new BadRequestException(`Failed to retrieve team requests: ${error.message}`);
    }
  }
}
