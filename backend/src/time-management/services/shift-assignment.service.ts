import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { CreateShiftAssignmentDto } from '../dto/create-shift-assignment.dto';
import { NotificationService } from './notification.service';

import { EmployeeProfile } from '../../employee-profile/Models/employee-profile.schema';
import { Department } from '../../organization-structure/Models/department.schema';
import { Position } from '../../organization-structure/Models/position.schema';
import { ShiftAssignmentStatus } from '../Models/enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ShiftAssignmentService {
  constructor(
    @InjectModel('ShiftAssignment')
    private readonly model: Model<ShiftAssignmentDocument>,

    private readonly notificationSvc: NotificationService,

    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<any>,

    @InjectModel(Department.name)
    private readonly deptModel: Model<any>,

    @InjectModel(Position.name)
    private readonly positionModel: Model<any>,
  ) {}

  // ---------------------------------------
  // Utils
  // ---------------------------------------
  private normalizeObjectId(value: any): Types.ObjectId | null {
    if (!value) return null;

    if (typeof value === 'object' && value._id) {
      const id = String(value._id).trim();
      return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return Types.ObjectId.isValid(trimmed)
        ? new Types.ObjectId(trimmed)
        : null;
    }

    return null;
  }

  // ---------------------------------------
  // Overlap check
  // ---------------------------------------
  private overlaps(existing, startDate, endDate) {
    const s = new Date(startDate).getTime();
    const e = endDate ? new Date(endDate).getTime() : Infinity;
    const es = new Date(existing.startDate).getTime();
    const ee = existing.endDate ? new Date(existing.endDate).getTime() : Infinity;
    return !(e < es || s > ee);
  }


  // ---------------------------------------
  // Create Assignment (PENDING)
  // ---------------------------------------
  async create(dto: CreateShiftAssignmentDto) {
    const employeeId = this.normalizeObjectId(dto.employeeId);
    const shiftId = this.normalizeObjectId(dto.shiftId);

    if (!employeeId) {
      throw new BadRequestException('Invalid employee ID');
    }

    if (!shiftId) {
      throw new BadRequestException('Invalid shift ID');
    }

    const employee = (await this.employeeModel
      .findById(employeeId)
      .lean()
      .exec()) as {
      _id: any;
      primaryDepartmentId?: any;
      primaryPositionId?: any;
    } | null;

    if (!employee) throw new NotFoundException('Employee not found');

    // derive org data from employee profile
    const departmentId =
  employee.primaryDepartmentId &&
  Types.ObjectId.isValid(String(employee.primaryDepartmentId).trim())
    ? new Types.ObjectId(String(employee.primaryDepartmentId).trim())
    : undefined;

const positionId =
  employee.primaryPositionId &&
  Types.ObjectId.isValid(String(employee.primaryPositionId).trim())
    ? new Types.ObjectId(String(employee.primaryPositionId).trim())
    : undefined;

    

    if (employee.primaryDepartmentId && !departmentId) {
      throw new BadRequestException(
        'Invalid department reference on employee',
      );
    }



    const existing = await this.model.find({
      employeeId,
      status: {
        $in: [
          ShiftAssignmentStatus.PENDING,
          ShiftAssignmentStatus.APPROVED,
        ],
      },
    });

    for (const ex of existing) {
      if (this.overlaps(ex, dto.startDate, dto.endDate)) {
        throw new BadRequestException(
          'Overlapping assignment exists for employee',
        );
      }
    }

    return this.model.create({
      employeeId,
      shiftId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      departmentId: departmentId ?? undefined,
      positionId: positionId ?? undefined,
      status: ShiftAssignmentStatus.PENDING,
    });
  }

  // ---------------------------------------
  // Employees for assignment selection
  // ---------------------------------------
  async getEmployeesForAssignment() {
    return this.employeeModel
      .find(
        { status: 'ACTIVE' },
        {
          _id: 1,
          employeeNumber: 1,
          workEmail: 1,
          firstName: 1,
          lastName: 1,
          primaryDepartmentId: 1,
          primaryPositionId: 1,
        },
      )
      .populate([
  { path: 'primaryDepartmentId', select: 'name' },
  // ❌ DO NOT populate primaryPositionId
    ]).lean();
  }

  // ---------------------------------------
  // Queries
  // ---------------------------------------
  async findAll() {
    return this.model.find({}).lean();
  }

  async findForEmployee(employeeId: string) {
    const normalizedId = this.normalizeObjectId(employeeId);
    if (!normalizedId) {
      throw new BadRequestException('Invalid employee ID');
    }

    return this.model.find({
      employeeId: normalizedId,
      status: {
        $in: [
          ShiftAssignmentStatus.PENDING,
          ShiftAssignmentStatus.APPROVED,
        ],
      },
    }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid assignment ID');
    }

    const doc = await this.model
      .findById(id)
      .populate(['shiftId'])
      .lean();

    if (!doc) throw new NotFoundException('Assignment not found');
    return doc;
  }

  // ---------------------------------------
  // Cron: Expire approved assignments
  // ---------------------------------------
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireAssignment() {
    const now = new Date();

    const expiredAssignments = await this.model.find({
      status: ShiftAssignmentStatus.APPROVED,
      endDate: { $lt: now },
    });

    for (const assignment of expiredAssignments) {
      assignment.status = ShiftAssignmentStatus.EXPIRED;
      await assignment.save();

      if (assignment.employeeId) {
        await this.notificationSvc.createNotification(
          assignment.employeeId,
          'Your shift assignment has expired.',
        );
      }
    }
  }

  // ---------------------------------------
  // Update (ONLY PENDING)
  // ---------------------------------------
  async update(id: string, patch: any) {
    const existing = await this.model.findById(id);
    if (!existing) throw new NotFoundException('Assignment not found');

    if (existing.status !== ShiftAssignmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending assignments can be edited',
      );
    }

    return this.model
      .findByIdAndUpdate(id, patch, { new: true })
      .lean();
  }

  // ---------------------------------------
  // Approval logic
  // ---------------------------------------
  async approve(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Assignment not found');

    if (doc.status !== ShiftAssignmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending assignments can be approved',
      );
    }

    doc.status = ShiftAssignmentStatus.APPROVED;
    await doc.save();

    if (doc.employeeId) {
      await this.notificationSvc.createNotification(
        doc.employeeId,
        'Your shift assignment has been approved.',
      );
    }

    return doc;
  }

  async reject(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Assignment not found');

    if (doc.status !== ShiftAssignmentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending assignments can be cancelled',
      );
    }

    doc.status = ShiftAssignmentStatus.CANCELLED;
    await doc.save();

    if (doc.employeeId) {
      await this.notificationSvc.createNotification(
        doc.employeeId,
        'Your shift assignment has been cancelled.',
      );
    }

    return doc;
  }
}
