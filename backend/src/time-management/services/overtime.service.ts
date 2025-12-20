import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeExceptionType } from '../Models/enums/index';

@Injectable()
export class OvertimeService {
  constructor(
    @InjectModel('AttendanceRecord') private readonly attendance: Model<any>,
    @InjectModel('OvertimeRule') private readonly overtimeRule: Model<any>,
    private readonly exceptionsSvc: any
  ) {}

  async createRequest(dto) {
    const rule = await this.overtimeRule.findOne({ active: true });

    if (!rule) throw new Error('No active overtime rule');

    const rec = await this.attendance.findById(dto.attendanceRecordId);
    rec.finalisedForPayroll = false;
    await rec.save();

    return {
      requestId: 'pending',
      message: 'Your overtime request is submitted and awaiting manager approval'
    };
  }

  async review(id, dto) {
    if (dto.status === 'APPROVED') {
      await this.exceptionsSvc.createException({
        employeeId: dto.employeeId,
        attendanceRecordId: dto.attendanceRecordId,
        type: TimeExceptionType.OVERTIME_REQUEST,
        reason: 'Approved overtime'
      });
    }

    return { updated: true };
  }
}
