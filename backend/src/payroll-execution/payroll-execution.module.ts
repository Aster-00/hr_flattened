import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';

import { employeePayrollDetails, employeePayrollDetailsSchema } from './Models/employeePayrollDetails.schema';
import { employeePenalties, employeePenaltiesSchema } from './Models/employeePenalties.schema';
import { employeeSigningBonus, employeeSigningBonusSchema } from './Models/EmployeeSigningBonus.schema';
import { payrollRuns, payrollRunsSchema } from './Models/payrollRuns.schema';
import { paySlip, paySlipSchema } from './Models/payslip.schema';
import { PayrollTrackingModule } from '../payroll-tracking/payroll-tracking.module';
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module';
import { TimeManagementModule } from '../time-management/time-management.module';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/Models/employee-profile.schema';
import { LeavesModule } from '../leaves/leaves.module';
import { LeaveRequest, LeaveRequestSchema } from '../leaves/Models/leave-request.schema';
import { LeaveType, LeaveTypeSchema } from '../leaves/Models/leave-type.schema';
import { taxRules, taxRulesSchema } from '../payroll-configuration/Models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsSchema } from '../payroll-configuration/Models/insuranceBrackets.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from './Models/EmployeeTerminationResignation.schema';
import { allowance, allowanceSchema } from '../payroll-configuration/Models/allowance.schema';
import { Department, DepartmentSchema } from '../organization-structure/Models/department.schema';
import { refunds, refundsSchema } from '../payroll-tracking/Models/refunds.schema';

@Module({
  imports: [forwardRef(() => PayrollTrackingModule), PayrollConfigurationModule, TimeManagementModule, EmployeeProfileModule, LeavesModule,
  MongooseModule.forFeature([
    { name: payrollRuns.name, schema: payrollRunsSchema },
    { name: paySlip.name, schema: paySlipSchema },
    { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
    { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
    { name: EmployeeTerminationResignation.name, schema: EmployeeTerminationResignationSchema },
    { name: employeePenalties.name, schema: employeePenaltiesSchema },
    { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
    { name: taxRules.name, schema: taxRulesSchema },
    { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
    { name: allowance.name, schema: allowanceSchema },
    { name: Department.name, schema: DepartmentSchema },
    { name: refunds.name, schema: refundsSchema },
    { name: LeaveRequest.name, schema: LeaveRequestSchema },
    { name: LeaveType.name, schema: LeaveTypeSchema },
  ])],
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService],
  exports: [PayrollExecutionService]
})
export class PayrollExecutionModule { }

