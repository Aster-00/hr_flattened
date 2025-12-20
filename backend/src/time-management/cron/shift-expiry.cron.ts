import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ShiftAssignmentDocument } from '../Models/shift-assignment.schema';
import { NotificationService } from '../services/notification.service';
import { ShiftAssignmentStatus } from '../Models/enums';

@Injectable()
export class ShiftExpiryCron {
  private readonly logger = new Logger(ShiftExpiryCron.name);

  constructor(
    @InjectModel('ShiftAssignment')
    private readonly assignmentModel: Model<ShiftAssignmentDocument>,

    private readonly notificationSvc: NotificationService,
  ) {}

  /**
   * ⏱ Runs every minute for testing
   * 🔁 Change to EVERY_DAY_AT_MIDNIGHT before submission
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running shift expiry monitor...');
    console.log('🔥 SHIFT CRON IS RUNNING 🔥', new Date().toISOString());

    const now = new Date();
    const NEAR_EXPIRY_DAYS = 7;

    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(now.getDate() + NEAR_EXPIRY_DAYS);

    // ======================
    // NEAR EXPIRY (APPROVED)
    // ======================
    const nearExpiryAssignments = await this.assignmentModel.find({
      endDate: { $gte: now, $lte: nearExpiryDate },
      status: ShiftAssignmentStatus.APPROVED,
    });

    for (const assignment of nearExpiryAssignments) {
      if (!assignment.employeeId) continue;

      // ✅ employeeId === EmployeeProfile._id
      await this.notificationSvc.createNotification(
        assignment.employeeId,
        `Your shift assignment will expire on ${assignment.endDate?.toDateString()}. Please renew or reassign.`,
      );

      this.logger.log(
        `Near-expiry notification → employee ${assignment.employeeId}`,
      );
    }

    // ======================
    // EXPIRED (APPROVED → EXPIRED)
    // ======================
    const expiredAssignments = await this.assignmentModel.find({
      endDate: { $lt: now },
      status: ShiftAssignmentStatus.APPROVED,
    });

    for (const assignment of expiredAssignments) {
      assignment.status = ShiftAssignmentStatus.EXPIRED;
      await assignment.save();

      if (!assignment.employeeId) continue;

      await this.notificationSvc.createNotification(
        assignment.employeeId,
        'Your shift assignment has expired.',
      );

      this.logger.log(
        `Expired notification → employee ${assignment.employeeId}`,
      );
    }

    this.logger.log(
      `Summary → Near expiry: ${nearExpiryAssignments.length}, Expired: ${expiredAssignments.length}`,
    );
  }
}
