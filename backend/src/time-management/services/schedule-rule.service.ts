import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleRuleDocument } from '../Models/schedule-rule.schema';
import { CreateScheduleRuleDto } from '../dto/create-schedule-rule.dto';

@Injectable()
export class ScheduleRuleService {
  constructor(
    @InjectModel('ScheduleRule')
    private readonly model: Model<ScheduleRuleDocument>,
  ) {}

  async create(dto: CreateScheduleRuleDto) {
    return this.model.create(dto);
  }

  async findAll() {
    return this.model.find({}).lean();
  }

  async findById(id: string) {
    const rule = await this.model.findById(id).lean();
    if (!rule) throw new NotFoundException('Schedule rule not found');
    return rule;
  }

  async update(id: string, dto: Partial<CreateScheduleRuleDto>) {
    const rule = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!rule) throw new NotFoundException('Schedule rule not found');
    return rule;
  }
}
