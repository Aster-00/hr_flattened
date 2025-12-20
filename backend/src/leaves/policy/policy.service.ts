import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeavePolicy } from '../Models/leave-policy.schema';

import { CreateLeavePolicyDto } from './dto/create-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-policy.dto';
import { UpdateEligibilityDto } from './dto/update-eligibility.dto';

@Injectable()
export class LeavePolicyService {
  constructor(
    @InjectModel(LeavePolicy.name)
    private policyModel: Model<LeavePolicy>,
  ) {}

  async create(dto: CreateLeavePolicyDto) {
    this.validatePolicy(dto);
    return this.policyModel.create(dto);
  }

  async findAll() {
    try {
      const policies = await this.policyModel
        .find()
        .populate({
          path: 'leaveTypeId',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

      console.log(`✅ [PolicyService] findAll: Found ${policies.length} policies`);
      return policies;
    } catch (error) {
      console.error('❌ [PolicyService] findAll error:', error);
      throw new BadRequestException(`Failed to retrieve policies: ${error.message}`);
    }
  }

  async findOne(id: string) {
    const policy = await this.policyModel.findById(id);
    if (!policy) throw new NotFoundException('Leave policy not found');
    return policy;
  }

  async update(id: string, dto: UpdateLeavePolicyDto) {
    this.validatePolicy(dto);
    const updated = await this.policyModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Leave policy not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.policyModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Leave policy not found');
    return deleted;
  }

  async findByLeaveTypeId(leaveTypeId: string) {
    const policy = await this.policyModel
      .findOne({ leaveTypeId })
      .populate('leaveTypeId')
      .exec();
    if (!policy) {
      throw new NotFoundException(`Policy not found for leave type ${leaveTypeId}`);
    }
    return policy;
  }

  // ------------------------------
  // VALIDATION LOGIC
  // ------------------------------
  private validatePolicy(dto: Partial<CreateLeavePolicyDto>) {
    if (dto.accrualMethod === 'monthly' && !dto.monthlyRate) {
      throw new BadRequestException(
        'monthlyRate is required when accrualMethod is monthly',
      );
    }

    if (dto.accrualMethod === 'yearly' && !dto.yearlyRate) {
      throw new BadRequestException(
        'yearlyRate is required when accrualMethod is yearly',
      );
    }

    if (dto.carryForwardAllowed && !dto.maxCarryForward) {
      throw new BadRequestException(
        'maxCarryForward is required when carryForwardAllowed = true',
      );
    }

    if (dto.approvalChain) {
      const invalid = dto.approvalChain.some((step) => !step.role || !step.level);
      if (invalid) throw new BadRequestException('Invalid approval chain format');
    }
  }

  async updateEligibility(id: string, dto: UpdateEligibilityDto) {
    const policy = await this.policyModel.findById(id);
    if (!policy) throw new NotFoundException('Leave policy not found');

    policy.eligibility = { ...(policy.eligibility || {}), ...dto };
    return policy.save();
  }
}
