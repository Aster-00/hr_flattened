// src/leaves/tracking/tracking.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveEntitlement } from '../Models/leave-entitlement.schema';
import { LeaveRequest } from '../Models/leave-request.schema';
import { LeavePolicy } from '../Models/leave-policy.schema';
import { HistoryFilterDto } from './dto/history-filter.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private readonly leaveEntitlementModel: Model<LeaveEntitlement>,
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeavePolicy.name)
    private readonly leavePolicyModel: Model<LeavePolicy>,
    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  // REQ-031: employee current balance
  async getMyCurrentBalances(
    query: BalanceQueryDto,
    userEmployeeId?: string,
  ) {
    try {
      const employeeId = userEmployeeId ?? query.employeeId;
      if (!employeeId) {
        throw new BadRequestException('employeeId is required');
      }

      console.log(`🔍 [TrackingService] getMyBalances for employee: ${employeeId}`);
      const employeeObjectId = new Types.ObjectId(employeeId);

      const entitlements = await this.leaveEntitlementModel
        .find({ employeeId: employeeObjectId })
        .populate({
          path: 'leaveTypeId',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

      // Map schema fields to frontend expected fields and calculate totals
      const mappedEntitlements = entitlements.map((ent: any) => ({
        ...ent,
        totalEntitlement: ent.yearlyEntitlement || 0,
        used: ent.taken || 0,
        available: ent.remaining || 0,
        carriedOver: ent.carryForward || 0,
      }));

      const totalUsed = mappedEntitlements.reduce((sum, ent: any) => sum + (ent.used || 0), 0);
      const totalAvailable = mappedEntitlements.reduce((sum, ent: any) => sum + (ent.available || 0), 0);

      console.log(`✅ [TrackingService] getMyBalances: Found ${entitlements.length} entitlements, totalUsed: ${totalUsed}, totalAvailable: ${totalAvailable}`);
      
      return {
        entitlements: mappedEntitlements,
        totalUsed,
        totalAvailable,
      };
    } catch (error) {
      console.error('❌ [TrackingService] getMyBalances error:', error);
      throw new BadRequestException(`Failed to retrieve balances: ${error.message}`);
    }
  }

  // REQ-032/033: employee history with filters
  async getMyHistory(
    filters: HistoryFilterDto,
    userEmployeeId?: string,
  ) {
    const employeeId = userEmployeeId ?? filters.employeeId;
    if (!employeeId) {
      throw new BadRequestException('employeeId is required');
    }

    const query: any = {
      employeeId: new Types.ObjectId(employeeId),
    };

    if (filters.leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.fromDate || filters.toDate) {
      query['dates.from'] = {};
      if (filters.fromDate) {
        query['dates.from'].$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        query['dates.from'].$lte = new Date(filters.toDate);
      }
    }

    return this.leaveRequestModel
      .find(query)
      .sort({ 'dates.from': -1 })
      .lean()
      .exec();
  }

  // REQ-034: team balances – manager / head sees team entitlements
  async getTeamBalances(managerId: string, filters: HistoryFilterDto) {
    // 1) Use employee-profile to get employees in manager's department
    const manager = await this.employeeProfileService.getEmployeeById(
      managerId,
      { roles: [SystemRole.SYSTEM_ADMIN] }
    );

    if (!manager) {
      throw new BadRequestException('Manager not found');
    }

    if (!manager.primaryDepartmentId) {
      throw new BadRequestException('Manager has no primary department');
    }

    const team = await this.employeeProfileService.getEmployeesInDepartment(
      manager.primaryDepartmentId.toString(),
      { employeeNumber: manager.employeeNumber },
    );

    const teamIds = team.map((e: any) => new Types.ObjectId(e._id));

    if (teamIds.length === 0) {
      console.log('⚠️ [TrackingService] getTeamBalances: No team members found');
      return { teamMembers: [] };
    }

    const query: any = {
      employeeId: { $in: teamIds },
    };

    if (filters.leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    }

    try {
      const balances = await this.leaveEntitlementModel
        .find(query)
        .populate({
          path: 'leaveTypeId',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

      console.log(`✅ [TrackingService] getTeamBalances: Found ${balances.length} entitlements for ${team.length} team members`);

      // Group entitlements by employee and build the response structure
      const employeeMap = new Map<string, any>();

      // Initialize map with all team members
      team.forEach((employee: any) => {
        const empId = employee._id.toString();
        employeeMap.set(empId, {
          employeeId: employee._id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeNumber: employee.employeeNumber,
          entitlements: []
        });
      });

      // Group entitlements by employee
      balances.forEach((entitlement: any) => {
        const empId = entitlement.employeeId.toString();
        if (employeeMap.has(empId)) {
          employeeMap.get(empId).entitlements.push({
            ...entitlement,
            leaveType: entitlement.leaveTypeId,
          });
        }
      });

      const teamMembers = Array.from(employeeMap.values());
      console.log(`✅ [TrackingService] getTeamBalances: Returning ${teamMembers.length} team members with balances`);

      return { teamMembers };
    } catch (error) {
      console.error('❌ [TrackingService] getTeamBalances error:', error);
      throw new BadRequestException(`Failed to retrieve team balances: ${error.message}`);
    }
  }

  // REQ-035: team history – manager / head sees team requests
  async getTeamHistory(managerId: string, filters: HistoryFilterDto) {
   const manager = await this.employeeProfileService.getEmployeeById(
  managerId,
  { roles: [SystemRole.SYSTEM_ADMIN] }
);

    if (!manager) {
      throw new BadRequestException('Manager not found');
    }

    if (!manager.primaryDepartmentId) {
      throw new BadRequestException('Manager has no primary department');
    }

    const team = await this.employeeProfileService.getEmployeesInDepartment(
      manager.primaryDepartmentId.toString(),
      { employeeNumber: manager.employeeNumber },
    );

    const teamIds = team.map((e: any) => new Types.ObjectId(e._id));

    if (teamIds.length === 0) {
      return [];
    }

    const query: any = {
      employeeId: { $in: teamIds },
    };

    if (filters.leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.fromDate || filters.toDate) {
      query['dates.from'] = {};
      if (filters.fromDate) {
        query['dates.from'].$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        query['dates.from'].$lte = new Date(filters.toDate);
      }
    }

    return this.leaveRequestModel
      .find(query)
      .sort({ 'dates.from': -1 })
      .lean()
      .exec();
  }

  // REQ-039: flag irregular patterns (simple implementation)
  async flagIrregularPattern(requestId: string) {
    const updated = await this.leaveRequestModel
      .findByIdAndUpdate(
        requestId,
        { $set: { irregularPatternFlag: true } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new BadRequestException('Leave request not found');
    }

    return updated;
  }

  // REQ-040: automatic accrual (manual trigger for now) with unpaid leave suspension
  async runAccrualJob() {
    const entitlements = await this.leaveEntitlementModel
      .find()
      .populate('employeeId leaveTypeId')
      .exec();

    const policies = await this.leavePolicyModel.find().lean().exec();
    const policyByType = new Map<string, any>();
    for (const p of policies) {
      policyByType.set(String(p.leaveTypeId), p);
    }

    let processed = 0;
    let skipped = 0;
    let updated = 0;
    const now = new Date();

    for (const e of entitlements) {
      processed++;

      // Check if employee is on unpaid leave
      const onUnpaidLeave = await this.leaveRequestModel.findOne({
        employeeId: (e.employeeId as any)._id,
        status: 'approved',
        'dates.from': { $lte: now },
        'dates.to': { $gte: now }
      }).populate('leaveTypeId').lean().exec();

      if (onUnpaidLeave && !(onUnpaidLeave.leaveTypeId as any).paid) {
        console.log(`⏸️ Skipping accrual for ${(e.employeeId as any)._id} - on unpaid leave`);
        skipped++;
        continue;
      }

      const policy = policyByType.get(String(e.leaveTypeId));
      if (!policy) continue;

      let increment = 0;
      if (
        policy.accrualMethod === AccrualMethod.MONTHLY &&
        policy.monthlyRate
      ) {
        increment = policy.monthlyRate;
      } else if (
        policy.accrualMethod === AccrualMethod.YEARLY &&
        policy.yearlyRate
      ) {
        increment = policy.yearlyRate;
      } else if (policy.accrualMethod === AccrualMethod.PER_TERM) {
        // TODO: define per-term logic
      }

      if (increment <= 0) continue;

      await this.leaveEntitlementModel.updateOne(
        { _id: e._id },
        {
          $inc: {
            accruedActual: increment,
            accruedRounded: increment,
            remaining: increment,
          },
          $set: { lastAccrualDate: new Date() },
        },
      );
      updated++;
    }

    console.log('✅ Accrual job completed:', { processed, updated, skipped });
    return { processed, updated, skipped };
  }

 
  // Pattern detection: detect irregular leave patterns
  async detectIrregularPatterns(filters: { startDate?: string; endDate?: string }) {
    const query: any = {};
    if (filters.startDate || filters.endDate) {
      query['dates.from'] = {};
      if (filters.startDate) query['dates.from'].$gte = new Date(filters.startDate);
      if (filters.endDate) query['dates.from'].$lte = new Date(filters.endDate);
    }

    const requests = await this.leaveRequestModel
      .find(query)
      .populate('employeeId', 'name email')
      .lean()
      .exec();

    const patterns = new Map();

    requests.forEach((req: any) => {
      const empId = req.employeeId._id.toString();
      if (!patterns.has(empId)) {
        patterns.set(empId, { employee: req.employeeId, fridays: 0, mondays: 0, shortLeaves: 0, total: 0 });
      }

      const p = patterns.get(empId);
      p.total++;

      const day = new Date(req.dates.from).getDay();
      if (day === 5) p.fridays++;
      if (day === 1) p.mondays++;
      if (req.durationDays <= 1) p.shortLeaves++;
    });

    const flagged: any[] = [];
    patterns.forEach((p) => {
      if (p.fridays > 3 || p.mondays > 3 || p.shortLeaves > 5) {
        flagged.push({ ...p, score: (p.fridays * 2) + (p.mondays * 2) + p.shortLeaves });
      }
    });

    console.log('📊 Pattern detection results:', { total: patterns.size, flagged: flagged.length });
    return { total: patterns.size, flagged: flagged.length, employees: flagged.sort((a: any, b: any) => b.score - a.score) };
  }

  // Pattern analysis for specific employee
  async analyzeEmployeePattern(employeeId: string) {
    const requests = await this.leaveRequestModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ 'dates.from': -1 })
      .limit(50)
      .lean()
      .exec();

    const byDay = [0, 0, 0, 0, 0, 0, 0];
    let shortLeaves = 0;

    requests.forEach((r: any) => {
      byDay[new Date(r.dates.from).getDay()]++;
      if (r.durationDays <= 1) shortLeaves++;
    });

    const flagged = byDay[1] > 3 || byDay[5] > 3 || shortLeaves > 5;
    console.log('📊 Employee pattern analysis:', { employeeId, totalRequests: requests.length, flagged });
    
    return {
      employeeId,
      totalRequests: requests.length,
      byDayOfWeek: byDay,
      shortLeaves,
      flagged
    };
  }

  // REQ-041: carry-forward job (manual trigger)
  async runCarryForwardJob() {
    // 1) Load all policies and index them by leaveTypeId
    const policies = await this.leavePolicyModel.find().lean().exec();
    const policyByType = new Map<string, any>();
    for (const p of policies) {
      policyByType.set(String(p.leaveTypeId), p);
    }

    // 2) Load all entitlements
    const entitlements = await this.leaveEntitlementModel
      .find()
      .lean()
      .exec();

    let processed = 0;

    for (const e of entitlements as any[]) {
      const policy = policyByType.get(String(e.leaveTypeId));
      if (!policy) continue;

      // Skip if carry-forward is not allowed
      if (!policy.carryForwardAllowed) continue;

      const entitlementId = e._id;

      const yearlyEntitlement: number = e.yearlyEntitlement ?? 0;
      const accruedRounded: number = e.accruedRounded ?? 0;
      const carryForward: number = e.carryForward ?? 0;
      const taken: number = e.taken ?? 0;
      const pending: number = e.pending ?? 0;
      const remaining: number = e.remaining ?? 0;

      if (remaining <= 0) continue;

      const maxCarryForward: number | undefined = policy.maxCarryForward;
      if (typeof maxCarryForward !== 'number' || maxCarryForward < 0) {
        // Bad or missing config; skip to avoid corrupting data
        continue;
      }

      // New carry-forward for next period, capped by policy
      const newCarryForward = Math.min(remaining, maxCarryForward);

      // Reset current-period accrual / usage counters
      const newAccruedActual = 0;
      const newAccruedRounded = 0;
      const newTaken = 0;
      const newPending = 0;
      const newYearlyEntitlement = yearlyEntitlement; // base stays per policy

      // Standard formula: remaining = yearlyEntitlement + accruedRounded + carryForward - taken - pending
      const newRemaining =
        (newYearlyEntitlement ?? 0) +
        newAccruedRounded +
        newCarryForward -
        newTaken -
        newPending;

      await this.leaveEntitlementModel.updateOne(
        { _id: entitlementId },
        {
          $set: {
            carryForward: newCarryForward,
            accruedActual: newAccruedActual,
            accruedRounded: newAccruedRounded,
            taken: newTaken,
            pending: newPending,
            yearlyEntitlement: newYearlyEntitlement,
            remaining: newRemaining,
          },
        },
      );

      processed++;
    }

    return { processed };
  }

}
