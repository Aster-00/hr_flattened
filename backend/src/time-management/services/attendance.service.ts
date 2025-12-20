import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AttendanceRecord } from '../Models/attendance-record.schema';
import { ShiftAssignment } from '../Models/shift-assignment.schema';
import { Shift } from '../Models/shift.schema';
import { LatenessRule } from '../Models/lateness-rule.schema';

import { TimeExceptionType } from '../Models/enums/index';
import { ExceptionsService } from '../services/exceptions.service';
import { PunchDto } from '../dto/punch.dto';

// ---------------------------
import { EmployeeProfile } from '../../employee-profile/Models/employee-profile.schema';
import { Department } from '../../organization-structure/Models/department.schema';
import { Position } from '../../organization-structure/Models/position.schema';
// ---------------------------

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel('AttendanceRecord') private readonly attendance: Model<AttendanceRecord>,
    @InjectModel('ShiftAssignment') private readonly assignment: Model<ShiftAssignment>,
    @InjectModel('Shift') private readonly shiftModel: Model<Shift>,
    @InjectModel('LatenessRule') private readonly latenessModel: Model<LatenessRule>,

    // Person C dependency
    private readonly exceptionsSvc: ExceptionsService,

    // Injected external repos (for later use)
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfile>,

    @InjectModel(Department.name)
    private readonly deptModel: Model<Department>,

    @InjectModel(Position.name)
    private readonly posModel: Model<Position>,

  ) {}

  // ✅ REQUIRED BY AttendanceController
  async findForEmployee(employeeId: string) {
    return this.attendance
      .find({ employeeId })
      .sort({ day: -1 })
      .lean();
  }

  async processPunch(dto: PunchDto) {
    const { employeeId, punchType, time } = dto;
    const timestamp = new Date(time);
    const day = new Date(timestamp.toDateString());

    let record = await this.attendance.findOne({ employeeId, day });

    if (!record) {
      record = await this.attendance.create({
        employeeId,
        punches: [],
        day,
        totalWorkMinutes: 0,
        hasMissedPunch: false,
        finalisedForPayroll: false,
      });
    }

    // Append punch
    record.punches.push({ type: punchType, time: timestamp });
    await record.save();

    // Validate IN/OUT sequence
    if (!this.validateSequence(record.punches)) {
      record.hasMissedPunch = true;
      await record.save();

      await this.exceptionsSvc.createException({
  employeeId,
  attendanceRecordId: record._id.toString(),
  type: TimeExceptionType.MISSED_PUNCH,
  reason: 'Invalid punch sequence',
  assignedTo: employeeId // TEMP: self-assigned for testing
});


      return { warning: 'MISSED_PUNCH exception created', record };
    }

    // Get shift assignment
    const assignment = await this.assignment.findOne({
      employeeId,
      startDate: { $lte: day },
      $or: [{ endDate: null }, { endDate: { $gte: day } }],
    });

    if (!assignment) return record;

    const shift = await this.shiftModel.findById(assignment.shiftId);

    this.computeWorkMinutes(record, shift);

    const latenessRule = await this.latenessModel.findOne({ active: true });
    await this.applyLateness(record, shift, latenessRule, employeeId);

    await record.save();
    return record;
  }

  validateSequence(punches) {
    let expected = 'IN';
    for (const p of punches) {
      if (p.type !== expected) return false;
      expected = expected === 'IN' ? 'OUT' : 'IN';
    }
    return true;
  }

  computeWorkMinutes(record, shift) {
    if (record.punches.length < 2) return;

    const firstIn = record.punches[0].time;
    const lastOut = record.punches[record.punches.length - 1].time;

    record.totalWorkMinutes = Math.floor((lastOut - firstIn) / 60000);
  }

  async applyLateness(record, shift, rule, employeeId) {
    if (!rule || record.punches.length === 0) return;

    const firstPunch = record.punches[0].time;

    const shiftStart = new Date(firstPunch);
    const [h, m] = shift.startTime.split(':');
    shiftStart.setHours(Number(h), Number(m));

    const allowed = shiftStart.getTime() + rule.gracePeriodMinutes * 60000;

    if (firstPunch.getTime() > allowed) {
      const minutesLate = Math.floor((firstPunch.getTime() - allowed) / 60000);

    await this.exceptionsSvc.createException({
  employeeId,
  attendanceRecordId: record._id.toString(),
  type: TimeExceptionType.LATE,
  reason: `Late by ${minutesLate} minutes`,
  assignedTo: employeeId
});

    }
  }
}
