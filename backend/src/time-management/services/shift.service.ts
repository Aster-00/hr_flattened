import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ShiftDocument } from '../Models/shift.schema';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel('Shift')
    private readonly model: Model<ShiftDocument>,
  ) {}

  private isOvernight(start: string, end: string) {
    // simple check: end <= start => overnight
    return end <= start;
  }

  async create(dto: CreateShiftDto) {
    dto.graceInMinutes ??= 0;
    dto.graceOutMinutes ??= 0;

    if (dto.graceInMinutes < 0 || dto.graceOutMinutes < 0) {
      throw new BadRequestException('Grace minutes must be >= 0');
    }

    return this.model.create(dto);
  }
  

  async findAll() {
    return this.model.find({}).lean();
  }

  async findOne(id: string) {
    // 🔒 HARD GUARDS (this fixes your CastError)
    if (!id || id === 'undefined') {
      throw new BadRequestException('Invalid shift id');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shift id');
    }

    const doc = await this.model.findById(id).lean();

    if (!doc) {
      throw new NotFoundException('Shift not found');
    }

    return doc;
  }

  async update(id: string, dto: UpdateShiftDto) {
    // 🔒 Same guards for update
    if (!id || id === 'undefined') {
      throw new BadRequestException('Invalid shift id');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid shift id');
    }

    const doc = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    if (!doc) {
      throw new NotFoundException('Shift not found');
    }

    return doc;
  }
}
