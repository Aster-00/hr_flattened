import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
      @InjectModel('Holiday')
      private readonly holidayModel: Model<any>,
  ) {}

  async createHoliday(dto: CreateHolidayDto) {
    const doc = await this.holidayModel.create({
      name: dto.name,
      type: dto.type,
      startDate: new Date(dto.startDate),
      ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      active: true,
    });

    return doc.toObject();
  }

  async findAll() {
    return this.holidayModel.find().sort({ startDate: -1 }).lean();
  }

  async findById(id: string) {
    const doc = await this.holidayModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Holiday not found');
    return doc;
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const doc = await this.holidayModel.findById(id);
    if (!doc) throw new NotFoundException('Holiday not found');

    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.startDate) doc.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) {
      doc.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    }
    if (dto.active !== undefined) doc.active = dto.active;

    await doc.save();
    return doc.toObject();
  }

  async remove(id: string) {
    const doc = await this.holidayModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Holiday not found');
    return { deleted: true };
  }

  async isHoliday(date: Date) {
    return this.holidayModel.exists({
      active: true,
      startDate: { $lte: date },
      $or: [
        { endDate: { $gte: date } },
        { endDate: { $exists: false } },
      ],
    });
  }
}

