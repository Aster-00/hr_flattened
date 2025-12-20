import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// ---------------------
// Controllers
// ---------------------
import { ShiftTypeController } from './controllers/shift-type.controller';
import { ShiftController } from './controllers/shift.controller';
import { ScheduleRuleController } from './controllers/schedule-rule.controller';
import { ShiftAssignmentController } from './controllers/shift-assignment.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { ExceptionsController } from './controllers/exceptions.controller';
import { HolidaysController } from './controllers/holidays.controller';
import { ReportingController } from './controllers/reporting.controller';
import { NotificationController } from './controllers/notification.controller';
import { TimeManagementController } from './time-management.controller';

// ---------------------
// Services
// ---------------------
import { ShiftTypeService } from './services/shift-type.service';
import { ShiftService } from './services/shift.service';
import { ScheduleRuleService } from './services/schedule-rule.service';
import { ShiftAssignmentService } from './services/shift-assignment.service';
import { AttendanceService } from './services/attendance.service';
import { NotificationService } from './services/notification.service';
import { ExceptionsService } from './services/exceptions.service';
import { HolidaysService } from './services/holidays.service';
import { ReportingService } from './services/reporting.service';
import { IntegrationService } from './services/integration.service';
import { TimeManagementService } from './time-management.service';

// ---------------------
// Cron Jobs
// ---------------------
import { ShiftExpiryCron } from './cron/shift-expiry.cron';
import { ExceptionEscalationCron } from './cron/exception-escalation.cron'; // ✅ ADDED

// ---------------------
// Models (Time Management)
// ---------------------
import { NotificationLog, NotificationLogSchema } from './Models/notification-log.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestSchema } from './Models/attendance-correction-request.schema';
import { ShiftType, ShiftTypeSchema } from './Models/shift-type.schema';
import { ScheduleRule, ScheduleRuleSchema } from './Models/schedule-rule.schema';
import { AttendanceRecord, AttendanceRecordSchema } from './Models/attendance-record.schema';
import { TimeException, TimeExceptionSchema } from './Models/time-exception.schema';
import { OvertimeRule, OvertimeRuleSchema } from './Models/overtime-rule.schema';
import { Shift, ShiftSchema } from './Models/shift.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from './Models/shift-assignment.schema';
import { LatenessRule, latenessRuleSchema } from './Models/lateness-rule.schema';
import { Holiday, HolidaySchema } from './Models/holiday.schema';

// ---------------------
// Cross-Module Models
// ---------------------
import { EmployeeProfile, EmployeeProfileSchema }
  from '../employee-profile/Models/employee-profile.schema';

import { Department, DepartmentSchema }
  from '../organization-structure/Models/department.schema';

import { Position, PositionSchema }
  from '../organization-structure/Models/position.schema';

// ---------------------
// Module Definition
// ---------------------
@Module({
  imports: [
    ScheduleModule.forRoot(),

    MongooseModule.forFeature([
      // Time-Management Schemas
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: ScheduleRule.name, schema: ScheduleRuleSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: TimeException.name, schema: TimeExceptionSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: LatenessRule.name, schema: latenessRuleSchema },
      { name: Holiday.name, schema: HolidaySchema },

      // Cross-module Schemas
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],

  controllers: [
    ShiftTypeController,
    ShiftController,
    ScheduleRuleController,
    ShiftAssignmentController,
    AttendanceController,
    NotificationController,
    ExceptionsController,
    HolidaysController,
    ReportingController,
    TimeManagementController,
  ],

  providers: [
    ShiftTypeService,
    ShiftService,
    ScheduleRuleService,
    ShiftAssignmentService,
    AttendanceService,
    NotificationService,
    ShiftExpiryCron,
    ExceptionEscalationCron, // ✅ REGISTERED
    ExceptionsService,
    HolidaysService,
    ReportingService,
    IntegrationService,
    TimeManagementService,
  ],

  exports: [
    ExceptionsService,
    HolidaysService,
    ReportingService,
    IntegrationService,
  ],
})
export class TimeManagementModule {}
