import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeExceptionDocument } from '../Models/time-exception.schema';

@Injectable()
export class TimeExceptionService {
  constructor(@InjectModel('TimeException') private readonly model: Model<TimeExceptionDocument>) {}

  async create(exception: Partial<TimeExceptionDocument>) {
    const doc = await this.model.create({
      ...exception,
      status: exception.status ?? 'OPEN',
      createdAt: new Date(),
    });
    return doc.toObject();
  }

  async findPendingForEmployee(employeeId: string) {
    return this.model.find({ employeeId, status: { $in: ['OPEN','PENDING'] } }).lean();
  }

  async updateStatus(id: string, status: string) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true }).lean();
  }
}
