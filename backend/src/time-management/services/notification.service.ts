import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationLogDocument } from '../Models/notification-log.schema';

@Injectable()
export class NotificationService {
  constructor(
      @InjectModel('NotificationLog')
      private readonly model: Model<NotificationLogDocument>,
  ) {}

  async createNotification(to: Types.ObjectId | string, message: string) {
    return this.model.create({
      to: new Types.ObjectId(to),
      type: 'SYSTEM',
      message,
      read: false, // allowed on create
    });
  }

  async findForEmployee(employeeId: string) {
    return this.model
        .find({ to: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .lean();
  }

  async markAsRead(notificationId: string, employeeId: string) {
    await this.model.updateOne(
        {
          _id: new Types.ObjectId(notificationId),
          to: new Types.ObjectId(employeeId),
        },
        {
          $set: { read: true },
        },
        {
          strict: false, // 🔥 THIS IS THE FIX
        },
    );

    return { success: true };
  }
}
