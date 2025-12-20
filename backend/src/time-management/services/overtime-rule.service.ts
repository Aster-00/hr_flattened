import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OvertimeRule } from '../Models/overtime-rule.schema';
import { CreateOvertimeRuleDto } from '../dto/create-overtime-rule.dto';
import { UpdateOvertimeRuleDto } from '../dto/update-overtime-rule.dto';

@Injectable()
export class OvertimeRuleService {
  constructor(
    @InjectModel(OvertimeRule.name)
    private readonly overtimeRuleModel: Model<OvertimeRule>,
  ) {}

  create(dto: CreateOvertimeRuleDto) {
    return this.overtimeRuleModel.create(dto);
  }

  findAll() {
    return this.overtimeRuleModel.find();
  }

  async findOne(id: string) {
    const rule = await this.overtimeRuleModel.findById(id);
    if (!rule) throw new NotFoundException('Overtime rule not found');
    return rule;
  }

  async update(id: string, dto: UpdateOvertimeRuleDto) {
    const updated = await this.overtimeRuleModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Overtime rule not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.overtimeRuleModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Overtime rule not found');
    return deleted;
  }
}
