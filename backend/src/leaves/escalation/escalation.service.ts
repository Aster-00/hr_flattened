// src/leaves/escalation/escalation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveRequest } from '../Models/leave-request.schema';
import { LeaveStatus } from '../enums/leave-status.enum';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequest>,
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Manual trigger (you can also add a @Cron decorator here if ScheduleModule is enabled)
  async runPendingEscalationJob() {
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const pending = await this.leaveRequestModel
        .find({
          status: LeaveStatus.PENDING,
          createdAt: { $lt: cutoff },
        })
        .populate({
          path: 'employeeId',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'leaveTypeId',
          options: { strictPopulate: false }
        })
        .lean()
        .exec();

    if (!pending.length) {
      return { escalated: 0 };
    }

    const hrAdmins = await this.employeeProfileService.findByRole(
      SystemRole.HR_ADMIN,
    );

    for (const req of pending as any[]) {
      const employee = req.employeeId;
      const leaveType = req.leaveTypeId;

      for (const hr of hrAdmins) {
        try {
          await this.notificationsService.emitForUser(
            hr._id.toString(),
            'Overdue leave request escalation',
            `Leave request for employee ${
              employee?.fullName || employee?.employeeNumber || 'employee'
            } (${leaveType?.name || 'Unknown type'}) has been pending for more than 48 hours and requires review.`,
            {
              requestId: req._id.toString(),
              employeeId: employee?._id?.toString(),
              leaveTypeId: leaveType?._id?.toString(),
              createdAt: req.createdAt,
            },
          );
        } catch {
          // Ignore notification failures
        }
      }
    }

    this.logger.log(`Escalated ${pending.length} overdue pending requests.`);
    return { escalated: pending.length };
    } catch (error) {
      console.error('❌ [EscalationService] runPendingEscalationJob error:', error);
      this.logger.error('Error running escalation job:', error);
      return { escalated: 0, error: error.message };
    }
  }
}
