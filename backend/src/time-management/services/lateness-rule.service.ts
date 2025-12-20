import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LatenessRule } from '../Models/lateness-rule.schema';
import { CreateLatenessRuleDto } from '../dto/create-lateness-rule.dto';
import { UpdateLatenessRuleDto } from '../dto/update-lateness-rule.dto';

@Injectable()
export class LatenessRuleService {
  constructor(
    @InjectModel(LatenessRule.name)
    private readonly latenessRuleModel: Model<LatenessRule>,
  ) {}

  create(dto: CreateLatenessRuleDto) {
    return this.latenessRuleModel.create(dto);
  }

  findAll() {
    return this.latenessRuleModel.find();
  }

  async findOne(id: string) {
    const rule = await this.latenessRuleModel.findById(id);
    if (!rule) throw new NotFoundException('Lateness rule not found');
    return rule;
  }

  async update(id: string, dto: UpdateLatenessRuleDto) {
    const updated = await this.latenessRuleModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Lateness rule not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.latenessRuleModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Lateness rule not found');
    return deleted;
  }
}
