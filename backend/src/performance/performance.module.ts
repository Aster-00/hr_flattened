import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import {
  AppraisalTemplate,
  AppraisalTemplateSchema,
} from './Models/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleSchema,
} from './Models/appraisal-cycle.schema';
import {
  AppraisalAssignment,
  AppraisalAssignmentSchema,
} from './Models/appraisal-assignment.schema';
import {
  AppraisalRecord,
  AppraisalRecordSchema,
} from './Models/appraisal-record.schema';
import {
  AppraisalDispute,
  AppraisalDisputeSchema,
} from './Models/appraisal-dispute.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/Models/employee-profile.schema';
import { Department, DepartmentSchema } from '../organization-structure/Models/department.schema';
import { Position, PositionSchema } from '../organization-structure/Models/position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalAssignment.name, schema: AppraisalAssignmentSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: AppraisalDispute.name, schema: AppraisalDisputeSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
    forwardRef(() => EmployeeProfileModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService, RolesGuard],
  exports: [PerformanceService],
})
export class PerformanceModule {}
