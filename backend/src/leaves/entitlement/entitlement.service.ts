import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveEntitlement } from '../Models/leave-entitlement.schema';
import { LeaveAdjustment } from '../Models/leave-adjustment.schema';
import { AdjustmentType } from '../enums/adjustment-type.enum';
import { CreateEntitlementDto } from './dto/create-entitlement.dto';
import { UpdateEntitlementDto } from './dto/update-entitlement.dto';
import { PersonalizedEntitlementDto } from './dto/personalized-entitlement.dto';

@Injectable()
export class EntitlementService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlement>,
    @InjectModel(LeaveAdjustment.name)
    private leaveAdjustmentModel: Model<LeaveAdjustment>,
  ) {}

  // Find all entitlements (optionally filter by employeeId)
  async findAll(employeeId?: string) {
    try {
      const query = employeeId 
        ? { employeeId: new Types.ObjectId(employeeId) }
        : {};
      
      const entitlements = await this.entitlementModel
        .find(query)
        .populate({
          path: 'leaveTypeId',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'employeeId',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

      console.log(`✅ [EntitlementService] findAll: Found ${entitlements.length} entitlements`);
      return entitlements;
    } catch (error) {
      console.error('❌ [EntitlementService] findAll error:', error);
      throw new BadRequestException(`Failed to retrieve entitlements: ${error.message}`);
    }
  }

  // 1️⃣ Create entitlement
  async create(dto: CreateEntitlementDto) {
    const entitlement = new this.entitlementModel({
      ...dto,
      accruedActual: 0,
      accruedRounded: 0,
      carryForward: 0,
      taken: 0,
      pending: 0,
      remaining: dto.yearlyEntitlement,
    });

    return entitlement.save();
  }

  // 2️⃣ Update (taken, pending, accrual…)
  async update(id: string, dto: UpdateEntitlementDto) {
    const ent = await this.entitlementModel.findById(id);
    if (!ent) throw new NotFoundException('Entitlement not found');

    Object.assign(ent, dto);

    ent.remaining =
      ent.yearlyEntitlement +
      ent.accruedRounded +
      ent.carryForward -
      ent.taken -
      ent.pending;

    return ent.save();
  }

  // 3️⃣ Personalized assignment (REQ-008)
  async assignPersonalized(dto: PersonalizedEntitlementDto) {
    // Handle both frontend (totalEntitlement) and backend (personalizedEntitlement) field names
    const entitlementValue = dto.totalEntitlement || dto.personalizedEntitlement || 0;
    const carriedOver = dto.carriedOver || 0;
    
    // Explicitly convert to ObjectIds
    const employeeObjectId = new Types.ObjectId(dto.employeeId);
    const leaveTypeObjectId = new Types.ObjectId(dto.leaveTypeId);
    
    console.log('🔍 [EntitlementService] assignPersonalized:', {
      employeeId: dto.employeeId,
      employeeObjectId: employeeObjectId.toString(),
      leaveTypeId: dto.leaveTypeId,
      leaveTypeObjectId: leaveTypeObjectId.toString(),
      entitlementValue,
      carriedOver
    });

    let ent = await this.entitlementModel.findOne({
      employeeId: employeeObjectId,
      leaveTypeId: leaveTypeObjectId,
    });

    if (!ent) {
      ent = new this.entitlementModel({
        employeeId: employeeObjectId,
        leaveTypeId: leaveTypeObjectId,
        yearlyEntitlement: entitlementValue,
        accruedActual: 0,
        accruedRounded: 0,
        carryForward: carriedOver,
        taken: 0,
        pending: 0,
        remaining: entitlementValue + carriedOver,
      });
      console.log('✅ [EntitlementService] Created new entitlement');
    } else {
      ent.yearlyEntitlement = entitlementValue;
      ent.carryForward = carriedOver;
      ent.remaining =
        ent.yearlyEntitlement +
        ent.accruedRounded +
        ent.carryForward -
        ent.taken -
        ent.pending;
      console.log('✅ [EntitlementService] Updated existing entitlement');
    }

    const saved = await ent.save();
    console.log('✅ [EntitlementService] Saved entitlement with IDs:', {
      _id: saved._id,
      employeeId: saved.employeeId,
      leaveTypeId: saved.leaveTypeId,
      employeeIdType: typeof saved.employeeId,
      leaveTypeIdType: typeof saved.leaveTypeId
    });
    return saved;
  }

  // 4️⃣ REQ-013: Manual balance adjustment with audit trail
  async manualAdjustment(dto: {
    employeeId: string;
    leaveTypeId: string;
    amount: number;
    adjustmentType: string;
    reason: string;
    hrUserId: string;
  }) {
    const { employeeId, leaveTypeId, amount, adjustmentType, reason, hrUserId } = dto;

    // Validate adjustment type
    if (!Object.values(AdjustmentType).includes(adjustmentType as AdjustmentType)) {
      throw new BadRequestException('Invalid adjustment type');
    }

    // Find entitlement
    const entitlement = await this.entitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found for this employee and leave type');
    }

    // Apply adjustment based on type
    switch (adjustmentType) {
      case AdjustmentType.ADD:
        entitlement.carryForward = (entitlement.carryForward || 0) + amount;
        break;
      case AdjustmentType.DEDUCT:
        entitlement.taken = (entitlement.taken || 0) + amount;
        break;
    
    }

    // Recalculate remaining balance
    entitlement.remaining =
      (entitlement.yearlyEntitlement || 0) +
      (entitlement.accruedRounded || 0) +
      (entitlement.carryForward || 0) -
      (entitlement.taken || 0) -
      (entitlement.pending || 0);

    await entitlement.save();

    // Create audit trail entry
    const adjustment = new this.leaveAdjustmentModel({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      adjustmentType: adjustmentType as AdjustmentType,
      amount,
      reason,
      hrUserId: new Types.ObjectId(hrUserId),
    });

    await adjustment.save();

    console.log('✅ Manual adjustment logged:', {
      employee: employeeId,
      leaveType: leaveTypeId,
      adjustmentType,
      amount,
      hrUser: hrUserId
    });

    return {
      message: 'Balance adjustment successful',
      entitlement,
      adjustment,
    };
  }
}
