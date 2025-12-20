import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';

import { Candidate, CandidateSchema } from './Models/candidate.schema';
import { ApplicationStatusHistory, ApplicationStatusHistorySchema } from 'src/recruitment/Models/application-history.schema';
import { Application, ApplicationSchema } from 'src/recruitment/Models/application.schema';
import { EmployeeProfile, EmployeeProfileSchema } from './Models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleSchema } from './Models/employee-system-role.schema';
import {
  EmployeeProfileChangeRequest,
  EmployeeProfileChangeRequestSchema,
} from './Models/ep-change-request.schema';
import { EmployeeQualification, EmployeeQualificationSchema } from './Models/qualification.schema';
import { CounterSchema } from './Models/counter.schema';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthModule } from 'src/auth/auth.module';
import { Department, DepartmentSchema } from 'src/organization-structure/Models/department.schema';
import { Position, PositionSchema } from 'src/organization-structure/Models/position.schema';
import { AppraisalRecord, AppraisalRecordSchema } from 'src/performance/Models/appraisal-record.schema';
import { AppraisalTemplate, AppraisalTemplateSchema } from 'src/performance/Models/appraisal-template.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      {
        name: EmployeeProfileChangeRequest.name,
        schema: EmployeeProfileChangeRequestSchema,
      },
      { name: 'Counter', schema: CounterSchema },
      { name: EmployeeQualification.name, schema: EmployeeQualificationSchema },
      { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
    ]),
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService, RolesGuard],

  // ✅ FIX: Export the service so AuthModule can use it
  exports: [EmployeeProfileService],
})
export class EmployeeProfileModule { }
