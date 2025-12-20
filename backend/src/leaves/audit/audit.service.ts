import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveAdjustment } from '../Models/leave-adjustment.schema';

@Injectable()
export class AuditService {
  constructor(@InjectModel(LeaveAdjustment.name) private leaveAdjustmentModel: Model<LeaveAdjustment>) {}

  async findAll(filters: any) {
    const query: any = {};
    if (filters.userId) query.hrUserId = new Types.ObjectId(filters.userId);
    if (filters.entityId) query.employeeId = new Types.ObjectId(filters.entityId);
    if (filters.createdAt) query.createdAt = filters.createdAt;

    const [data, total] = await Promise.all([
      this.leaveAdjustmentModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('hrUserId', 'name email')
        .populate('employeeId', 'name email')
        .populate('leaveTypeId', 'name')
        .exec(),
      this.leaveAdjustmentModel.countDocuments(query).exec()
    ]);
    return { data, total };
  }

  async findByEntity(entityType: string, entityId: string) {
    if (entityType !== 'LeaveEntitlement') return [];
    
    return this.leaveAdjustmentModel
      .find({ employeeId: new Types.ObjectId(entityId) })
      .sort({ createdAt: -1 })
      .populate('hrUserId', 'name email')
      .populate('employeeId', 'name email')
      .populate('leaveTypeId', 'name')
      .exec();
  }
}
