// src/leaves/leaves.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { TrackingController } from './tracking/tracking.controller';
import { TrackingService } from './tracking/tracking.service';
import { HrLeaveController } from './controllers/hr-leave.controller';

import {
  Attachment,
  AttachmentSchema,
} from './Models/attachment.schema';
import {
  Calendar,
  CalendarSchema,
} from './Models/calendar.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentSchema,
} from './Models/leave-adjustment.schema';
import {
  LeaveCategory,
  LeaveCategorySchema,
} from './Models/leave-category.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementSchema,
} from './Models/leave-entitlement.schema';
import {
  LeavePolicy,
  LeavePolicySchema,
} from './Models/leave-policy.schema';
import {
  LeaveRequest,
  LeaveRequestSchema,
} from './Models/leave-request.schema';
import {
  LeaveType,
  LeaveTypeSchema,
} from './Models/leave-type.schema';

import {
  Holiday,
  HolidaySchema,
} from '../time-management/Models/holiday.schema';

import { RequestsController } from './requests/requests.controller';
import { RequestsService } from './requests/requests.service';
import { LeaveTypeController } from './type/type.controller';
import { LeaveTypeService } from './type/type.service';
import { LeavePolicyController } from './policy/policy.controller';
import { LeavePolicyService } from './policy/policy.service';
import { LeaveCategoryController } from './category/category.controller';
import { CalendarsController } from './calendars/calendars.controller';
import { EntitlementController } from './entitlement/entitlement.controller';
import { HolidaysController } from './holidays/holidays.controller';
import { EscalationController } from './escalation/escalation.controller';
import { AuditModule } from './audit/audit.module';
import { SettlementModule } from './settlement/settlement.module';

// Services
import { CalendarsService } from './calendars/calendars.service';
import { NotificationsService } from './notifications/notifications.service';
import { EntitlementService } from './entitlement/entitlement.service';
import { HolidaysService } from './holidays/holidays.service';
import { EscalationService } from './escalation/escalation.service';

// Cross‑module imports
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema },
      { name: Calendar.name, schema: CalendarSchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: Holiday.name, schema: HolidaySchema },
      // No NotificationLog schema needed
    ]),
    AuditModule,
    SettlementModule,
    forwardRef(() => EmployeeProfileModule),
    forwardRef(() => TimeManagementModule),
  ],
  controllers: [
    LeavesController,
    HrLeaveController,
    RequestsController,
    TrackingController,
    EscalationController,
    LeaveTypeController,
    LeavePolicyController,
    LeaveCategoryController,
    CalendarsController,
    EntitlementController,
    HolidaysController,
  ],
  providers: [
    LeavesService,
    RequestsService,
    TrackingService,
    EscalationService,
    CalendarsService,
    NotificationsService,
    LeaveTypeService,
    LeavePolicyService,
    EntitlementService,
    HolidaysService,
  ],
  exports: [LeavesService, RequestsService, EntitlementService],})
export class LeavesModule {}
