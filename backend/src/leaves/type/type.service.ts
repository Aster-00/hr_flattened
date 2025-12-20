import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveType } from '../Models/leave-type.schema';

import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveType>,
  ) {}

  async create(dto: CreateLeaveTypeDto) {
    if (dto.requiresAttachment && !dto.attachmentType) {
      throw new BadRequestException('Attachment type required when requiresAttachment = true');
    }
    return this.leaveTypeModel.create(dto);
  }

  async findAll() {
    return this.leaveTypeModel.find();
  }

  async findOne(id: string) {
    const type = await this.leaveTypeModel.findById(id);
    if (!type) throw new NotFoundException('Leave type not found');
    return type;
  }

  async update(id: string, dto: UpdateLeaveTypeDto) {
    const type = await this.leaveTypeModel.findByIdAndUpdate(id, dto, { new: true });
    if (!type) throw new NotFoundException('Leave type not found');
    return type;
  }

  async remove(id: string) {
    const deleted = await this.leaveTypeModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Leave type not found');
    return deleted;
  }
}
