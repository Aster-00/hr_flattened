import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Holiday } from '../.././time-management/Models/holiday.schema';
import { Model } from 'mongoose';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(@InjectModel(Holiday.name) private holidayModel: Model<Holiday>) {}

  create(dto: CreateHolidayDto) {
    return this.holidayModel.create(dto);
  }

  findAll() {
    return this.holidayModel.find();
  }

  findOne(id: string) {
    return this.holidayModel.findById(id);
  }

  async update(id: string, dto: UpdateHolidayDto) {
    const updated = await this.holidayModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Holiday not found');
    return updated;
  }

  delete(id: string) {
    return this.holidayModel.findByIdAndDelete(id);
  }
}
