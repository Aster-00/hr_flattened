import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    @InjectModel('TimeException') private readonly exceptionModel: Model<any>,
    @InjectModel('NotificationLog') private readonly notificationModel: Model<any>,
  ) {}

  /**
   * Sync approved exceptions to external systems (Payroll / Leaves)
   * This implementation is intentionally generic:
   * - It calls configured endpoints via env variables
   * - It marks exception.synced = true on success
   */
  async syncApprovedExceptions() {
    const toSync = await this.exceptionModel.find({ status: 'APPROVED', synced: { $ne: true } });
    for (const ex of toSync) {
      try {
        // Build payload
        const payload = {
          exceptionId: ex._id,
          employeeId: ex.employeeId,
          type: ex.type,
          reason: ex.reason,
          attendanceRecordId: ex.attendanceRecordId,
        };

        // Example: call payroll service
        const payrollUrl = process.env.PAYROLL_SYNC_URL;
        const leavesUrl = process.env.LEAVES_SYNC_URL;

        if (payrollUrl) {
          await axios.post(payrollUrl, payload, { timeout: 5000 });
        }
        if (leavesUrl && ex.type === 'PERMISSION') {
          await axios.post(leavesUrl, payload, { timeout: 5000 });
        }

        ex.synced = true;
        ex.syncedAt = new Date();
        await ex.save();

        await this.notificationModel.create({
          employeeId: ex.employeeId,
          message: `Exception ${ex._id} synced to external systems`,
          type: 'SYNC_SUCCESS',
          createdAt: new Date(),
        });
      } catch (err) {
        this.logger.warn('Failed to sync exception ' + ex._id + ' : ' + err.message);
        // keep unsynced; optionally write a failure log
        await this.notificationModel.create({
          employeeId: ex.employeeId,
          message: `Failed to sync exception ${ex._id}: ${err.message}`,
          type: 'SYNC_FAILURE',
          createdAt: new Date(),
        });
      }
    }
    return { synced: toSync.length };
  }
}
