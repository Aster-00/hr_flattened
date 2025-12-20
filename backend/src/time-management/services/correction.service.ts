import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CorrectionService {
  constructor(
      @InjectModel('AttendanceCorrectionRequest')
      private readonly correction: Model<any>,

      @InjectModel('AttendanceRecord')
      private readonly attendance: Model<any>,
  ) {}

  async createRequest(dto: any) {
    const req = await this.correction.create(dto);

    const rec = await this.attendance.findById(dto.attendanceRecordId);
    if (rec) {
      rec.finalisedForPayroll = false;
      await rec.save();
    }

    return req;
  }

  async reviewRequest(id: string, dto: any) {
    const req = await this.correction.findById(id);
    if (!req) return null;

    req.status = dto.status;
    req.managerComment = dto.managerComment || null;
    await req.save();

    const rec = await this.attendance.findById(req.attendanceRecord);
    if (rec && dto.status === 'APPROVED') {
      rec.hasMissedPunch = false;
      rec.finalisedForPayroll = true;
      await rec.save();
    }

    return req;
  }

  // 🔬 FULL DEBUG VERSION — DO NOT MODIFY
  async findAll() {
    console.log('\n===== DEBUG: CorrectionService.findAll =====');

    console.log('Model name:', this.correction.modelName);
    console.log('Collection name:', this.correction.collection.name);
    console.log('Database name:', this.correction.db.name);

    const count = await this.correction.countDocuments();
    console.log('countDocuments():', count);

    const data = await this.correction.find().lean().exec();

    console.log('Returned array length:', data.length);
    console.log('First document:', data[0]);

    console.log('===== END DEBUG =====\n');

    return data;
  }
}
