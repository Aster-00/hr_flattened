import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';

import { OrganizationStructureController } from './organization-structure.controller';
import { OrganizationStructureService } from './organization-structure.service';

import { Department, DepartmentSchema, DepartmentDocument } from './Models/department.schema';
import { Position, PositionSchema, PositionDocument } from './Models/position.schema';
import { PositionAssignment, PositionAssignmentSchema } from './Models/position-assignment.schema';
import { StructureApproval, StructureApprovalSchema } from './Models/structure-approval.schema';
import { StructureChangeLog, StructureChangeLogSchema } from './Models/structure-change-log.schema';
import { StructureChangeRequest, StructureChangeRequestSchema } from './Models/structure-change-request.schema';
import { EmployeeProfile, EmployeeProfileSchema } from 'src/employee-profile/Models/employee-profile.schema';
import { NotificationLog, NotificationLogSchema } from 'src/time-management/Models/notification-log.schema';

/**
 * Ensure Department model is registered in default mongoose connection
 * Needed for Position schema pre-save hook that calls mongoose.model('Department')
 */
const registerDepartmentModel = () => {
  const defaultConnection = mongoose.connection;

  if (!defaultConnection.models[Department.name]) {
    defaultConnection.model(Department.name, DepartmentSchema); // ✅ no generic needed
  }

  if (!mongoose.models[Department.name]) {
    mongoose.model(Department.name, DepartmentSchema);
  }
};

// Register immediately when module loads
registerDepartmentModel();

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      { name: PositionAssignment.name, schema: PositionAssignmentSchema },
      { name: StructureApproval.name, schema: StructureApprovalSchema },
      { name: StructureChangeLog.name, schema: StructureChangeLogSchema },
      { name: StructureChangeRequest.name, schema: StructureChangeRequestSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
  ],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService],
})
export class OrganizationStructureModule implements OnModuleInit {
  constructor(@Inject(getConnectionToken()) private connection: Connection) {}

  onModuleInit() {
    // Register Department model on NestJS connection (used by @InjectModel)
    if (!this.connection.models[Department.name]) {
      this.connection.model(Department.name, DepartmentSchema); // ✅ no generic
    }

    // Ensure it’s registered in default connection and global cache
    registerDepartmentModel();
  }
}
