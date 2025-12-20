import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveEntitlement } from '../Models/leave-entitlement.schema';
import { LeaveType } from '../Models/leave-type.schema';

@Injectable()
export class SettlementService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlement>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveType>
  ) {}

  async calculateFinalSettlement(employeeId: string, lastWorkingDay: Date) {
    console.log('🔍 Fetching entitlements for employee:', employeeId);

    // Get all entitlements for employee
    const entitlements = await this.leaveEntitlementModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('leaveTypeId')
      .lean()
      .exec();

    if (!entitlements || entitlements.length === 0) {
      throw new NotFoundException(`No entitlements found for employee ${employeeId}`);
    }

    const settlement = {
      employeeId,
      lastWorkingDay: lastWorkingDay.toISOString(),
      calculatedAt: new Date().toISOString(),
      totalEncashableDays: 0,
      byLeaveType: [] as any[]
    };

    // Calculate encashable days per leave type
    for (const entitlement of entitlements) {
      const leaveType = entitlement.leaveTypeId as any;

      // Only paid leave types are encashable
      if (!leaveType || !leaveType.paid) {
        continue;
      }

      // Calculate: remaining + carryForward
      const encashableDays = (entitlement.remaining || 0) + (entitlement.carryForward || 0);

      if (encashableDays > 0) {
        settlement.byLeaveType.push({
          leaveTypeId: leaveType._id,
          leaveTypeName: leaveType.name,
          leaveTypeCode: leaveType.code,
          remaining: entitlement.remaining || 0,
          carryForward: entitlement.carryForward || 0,
          encashableDays,
          paid: leaveType.paid
        });

        settlement.totalEncashableDays += encashableDays;
      }
    }

    console.log('✅ Settlement calculated:', { 
      employeeId, 
      totalEncashableDays: settlement.totalEncashableDays,
      leaveTypes: settlement.byLeaveType.length 
    });

    return settlement;
  }
}
