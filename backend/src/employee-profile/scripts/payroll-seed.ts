// // import mongoose from 'mongoose';
// // import { Types } from 'mongoose';

// // import { Department, DepartmentSchema } from '../../organization-structure/Models/department.schema';
// // import { Position, PositionSchema } from '../../organization-structure/Models/position.schema';
// // import { EmployeeProfile, EmployeeProfileSchema } from '../Models/employee-profile.schema';
// // import { EmployeeSystemRole, EmployeeSystemRoleSchema } from '../Models/employee-system-role.schema';
// // import { EmployeeStatus, ContractType, WorkType, SystemRole } from '../enums/employee-profile.enums';

// // import { Counter, CounterSchema } from '../Models/counter.schema';

// // import { payGradeSchema } from '../../payroll-configuration/Models/payGrades.schema';
// // import { taxRulesSchema } from '../../payroll-configuration/Models/taxRules.schema';
// // import { insuranceBracketsSchema } from '../../payroll-configuration/Models/insuranceBrackets.schema';
// // import { allowanceSchema } from '../../payroll-configuration/Models/allowance.schema';

// // import { employeeSigningBonusSchema } from '../../payroll-execution/Models/EmployeeSigningBonus.schema';
// // import { refundsSchema } from '../../payroll-tracking/Models/refunds.schema';
// // import { employeePenaltiesSchema } from '../../payroll-execution/Models/employeePenalties.schema';
// // import { LeaveRequestSchema } from '../../leaves/Models/leave-request.schema';

// // import { ConfigStatus } from '../../payroll-configuration/enums/payroll-configuration-enums';
// // import { BonusStatus } from '../../payroll-execution/enums/payroll-execution-enum';
// // import { RefundStatus } from '../../payroll-tracking/enums/payroll-tracking-enum';
// // import { LeaveStatus } from '../../leaves/enums/leave-status.enum';

// // async function main() {
// //   await mongoose.connect(
// //     'mongodb+srv://kanzy:UKNASQYpMP8fhSfS@hrcuster.fqiw4vw.mongodb.net/payroll-test?retryWrites=true&w=majority'
// //   );
// //   console.log('✅ Connected to MongoDB');

// //   /* --------------------------------------------------
// //      REGISTER MODELS (SAFE)
// //   -------------------------------------------------- */
// //   const CounterModel = mongoose.model('Counter', CounterSchema);
// //   const DepartmentModel = mongoose.model('Department', DepartmentSchema);
// //   const PositionModel = mongoose.model('Position', PositionSchema);

// //   const EmployeeProfileModel = mongoose.models.EmployeeProfile || mongoose.model(EmployeeProfile.name, EmployeeProfileSchema);
// //   const EmployeeSystemRoleModel = mongoose.models.EmployeeSystemRole || mongoose.model(EmployeeSystemRole.name, EmployeeSystemRoleSchema);
  
// //   const PayGradeModel =
// //     mongoose.models.payGrade || mongoose.model('payGrade', payGradeSchema);

// //   const TaxRulesModel =
// //     mongoose.models.taxRules || mongoose.model('taxRules', taxRulesSchema);

// //   const InsuranceModel =
// //     mongoose.models.insuranceBrackets ||
// //     mongoose.model('insuranceBrackets', insuranceBracketsSchema);

// //   const AllowanceModel =
// //     mongoose.models.allowance || mongoose.model('allowance', allowanceSchema);

// //   const SigningBonusModel =
// //     mongoose.models.employeeSigningBonus ||
// //     mongoose.model('employeeSigningBonus', employeeSigningBonusSchema);

// //   const RefundsModel =
// //     mongoose.models.refunds || mongoose.model('refunds', refundsSchema);

// //   const PenaltiesModel =
// //     mongoose.models.employeePenalties ||
// //     mongoose.model('employeePenalties', employeePenaltiesSchema);

// //   const LeaveRequestModel =
// //     mongoose.models.LeaveRequest ||
// //     mongoose.model('LeaveRequest', LeaveRequestSchema);

// //   /* --------------------------------------------------
// //      OPTIONAL CLEANUP
// //   -------------------------------------------------- */
// //   // await Promise.all([
// //   //   PayGradeModel.deleteMany({}),
// //   //   TaxRulesModel.deleteMany({}),
// //   //   InsuranceModel.deleteMany({}),
// //   //   AllowanceModel.deleteMany({}),
// //   //   SigningBonusModel.deleteMany({}),
// //   //   RefundsModel.deleteMany({}),
// //   //   PenaltiesModel.deleteMany({}),
// //   //   LeaveRequestModel.deleteMany({}),
// //   // ]);

// //   /* --------------------------------------------------
// //      SHARED EMPLOYEE IDS (MATCH EMPLOYEE SEED)
// //   -------------------------------------------------- */
// //   const employees = Array.from({ length: 20 }).map(
// //     () => new Types.ObjectId()
// //   );

// //   /* --------------------------------------------------
// //      PAY GRADES
// //   -------------------------------------------------- */
// //   await PayGradeModel.insertMany([
// //     { grade: 'Junior', baseSalary: 3000, grossSalary: 3000, status: ConfigStatus.APPROVED },
// //     { grade: 'Mid', baseSalary: 6000, grossSalary: 6000, status: ConfigStatus.APPROVED },
// //     { grade: 'Senior', baseSalary: 12000, grossSalary: 12000, status: ConfigStatus.APPROVED },
// //   ]);

// //   /* --------------------------------------------------
// //      TAX RULE
// //   -------------------------------------------------- */
// //   await TaxRulesModel.create({
// //     name: 'Income Tax 10%',
// //     rate: 10,
// //     status: ConfigStatus.APPROVED,
// //   });

// //   /* --------------------------------------------------
// //      INSURANCE
// //   -------------------------------------------------- */
// //   await InsuranceModel.insertMany([
// //     {
// //       name: 'Social Insurance',
// //       minSalary: 1000,
// //       maxSalary: 8000,
// //       employeeRate: 11,
// //       employerRate: 18,
// //       amount: 0,
// //       status: ConfigStatus.APPROVED,
// //     },
// //     {
// //       name: 'Medical Insurance',
// //       minSalary: 0,
// //       maxSalary: 10000,
// //       employeeRate: 3,
// //       employerRate: 5,
// //       amount: 0,
// //       status: ConfigStatus.APPROVED,
// //     },
// //   ]);

// //   /* --------------------------------------------------
// //      ALLOWANCES
// //   -------------------------------------------------- */
// //   await AllowanceModel.insertMany([
// //     { name: 'Housing Allowance', amount: 1000, status: ConfigStatus.APPROVED },
// //     { name: 'Transport Allowance', amount: 500, status: ConfigStatus.APPROVED },
// //   ]);

// //   /* --------------------------------------------------
// //      SIGNING BONUSES (SCENARIOS 10,11,14)
// //   -------------------------------------------------- */
// //   await SigningBonusModel.insertMany([
// //     { employeeId: employees[9], signingBonusId: new Types.ObjectId(), givenAmount: 2000, status: BonusStatus.PENDING },
// //     { employeeId: employees[10], signingBonusId: new Types.ObjectId(), givenAmount: 1000, status: BonusStatus.PENDING },
// //     { employeeId: employees[10], signingBonusId: new Types.ObjectId(), givenAmount: 1500, status: BonusStatus.PENDING },
// //     { employeeId: employees[13], signingBonusId: new Types.ObjectId(), givenAmount: 3000, status: BonusStatus.PENDING },
// //   ]);

// //   /* --------------------------------------------------
// //      REFUNDS (SCENARIOS 12,14)
// //   -------------------------------------------------- */
// //   await RefundsModel.insertMany([
// //     {
// //       employeeId: employees[11],
// //       refundDetails: { description: 'Expense Claim', amount: 800 },
// //       status: RefundStatus.PENDING,
// //     },
// //     {
// //       employeeId: employees[13],
// //       refundDetails: { description: 'Travel Reimbursement', amount: 500 },
// //       status: RefundStatus.PENDING,
// //     },
// //   ]);

// //   /* --------------------------------------------------
// //      PENALTIES (SCENARIOS 15,16,19)
// //   -------------------------------------------------- */
// //   await PenaltiesModel.insertMany([
// //     {
// //       employeeId: employees[14],
// //       penalties: [{ reason: 'Lateness', amount: 300 }],
// //     },
// //     {
// //       employeeId: employees[15],
// //       penalties: [
// //         { reason: 'Lateness', amount: 200 },
// //         { reason: 'Misconduct', amount: 500 },
// //       ],
// //     },
// //     {
// //       employeeId: employees[18],
// //       penalties: [{ reason: 'Severe Violation', amount: 7000 }],
// //     },
// //   ]);

// //   /* --------------------------------------------------
// //      UNPAID LEAVE (SCENARIO 17)
// //   -------------------------------------------------- */
// //   await LeaveRequestModel.create({
// //     employeeId: employees[16],
// //     leaveTypeId: new Types.ObjectId(),
// //     dates: { from: new Date('2025-05-10'), to: new Date('2025-05-12') },
// //     durationDays: 3,
// //     status: LeaveStatus.APPROVED,
// //   });

// //   console.log('✅ Payroll dummy data inserted successfully');
// //   process.exit(0);
// // }

// // main().catch((err) => {
// //   console.error('❌ Seed failed', err);
// //   process.exit(1);
// // });


// import mongoose from 'mongoose';
// import { Types } from 'mongoose';

// import { payGradeSchema } from '../../payroll-configuration/Models/payGrades.schema';
// import { taxRulesSchema } from '../../payroll-configuration/Models/taxRules.schema';
// import { insuranceBracketsSchema } from '../../payroll-configuration/Models/insuranceBrackets.schema';
// import { allowanceSchema } from '../../payroll-configuration/Models/allowance.schema';

// import { employeeSigningBonusSchema } from '../../payroll-execution/Models/EmployeeSigningBonus.schema';
// import { refundsSchema } from '../../payroll-tracking/Models/refunds.schema';
// import { employeePenaltiesSchema } from '../../payroll-execution/Models/employeePenalties.schema';
// import { LeaveRequestSchema } from '../../leaves/Models/leave-request.schema';

// import { ConfigStatus } from '../../payroll-configuration/enums/payroll-configuration-enums';
// import { BonusStatus } from '../../payroll-execution/enums/payroll-execution-enum';
// import { RefundStatus } from '../../payroll-tracking/enums/payroll-tracking-enum';
// import { LeaveStatus } from '../../leaves/enums/leave-status.enum';

// import { EmployeeProfile } from '../Models/employee-profile.schema';
// import { EmployeeSystemRole } from '../Models/employee-system-role.schema';
// import { Counter } from '../Models/counter.schema';
// import { SystemRole, EmployeeStatus, ContractType, WorkType } from '../enums/employee-profile.enums';


// // ------------------------------
// // MAIN FUNCTION
// // ------------------------------
// async function main() {
//   await mongoose.connect(
//     'mongodb+srv://kanzy:UKNASQYpMP8fhSfS@hrcuster.fqiw4vw.mongodb.net/payroll-test?retryWrites=true&w=majority'
//   );
//   console.log('✅ Connected to MongoDB');

//   // ------------------------------
//   // REGISTER MODELS
//   // ------------------------------
//   const PayGradeModel = mongoose.models.payGrade || mongoose.model('payGrade', payGradeSchema);
//   const TaxRulesModel = mongoose.models.taxRules || mongoose.model('taxRules', taxRulesSchema);
//   const InsuranceModel = mongoose.models.insuranceBrackets || mongoose.model('insuranceBrackets', insuranceBracketsSchema);
//   const AllowanceModel = mongoose.models.allowance || mongoose.model('allowance', allowanceSchema);

//   const SigningBonusModel = mongoose.models.employeeSigningBonus || mongoose.model('employeeSigningBonus', employeeSigningBonusSchema);
//   const RefundsModel = mongoose.models.refunds || mongoose.model('refunds', refundsSchema);
//   const PenaltiesModel = mongoose.models.employeePenalties || mongoose.model('employeePenalties', employeePenaltiesSchema);
//   const LeaveRequestModel = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
// const EmployeeProfileModel = mongoose.models.EmployeeProfile || mongoose.model('EmployeeProfile', EmployeeProfile.schema || EmployeeProfile);
// const EmployeeSystemRoleModel = mongoose.models.EmployeeSystemRole || mongoose.model('EmployeeSystemRole', EmployeeSystemRole.schema || EmployeeSystemRole);
// const CounterModel = mongoose.models.Counter || mongoose.model('Counter', Counter.schema || Counter);

//   const hrDeptId = '69275ddefc1184a3b3e6c561';
//   const engDeptId = '69275d8afc1184a3b3e6c55f';
//   const financeDeptId = '6929e10799be1a7939a2e04e'; // Example 3rd department

//   const commonData = {
//     password: "password123",
//     contractType: ContractType.FULL_TIME_CONTRACT,
//     workType: WorkType.FULL_TIME,
//     dateOfHire: new Date("2024-01-01"),
//     status: EmployeeStatus.ACTIVE,
//   };

//   // ------------------------------
//   // EMPLOYEES
//   // ------------------------------
//   //const employees = Array.from({ length: 20 }).map(() => new Types.ObjectId());

//   // ===============================
// // Employee Seed List (20 Employees)
// // ===============================
// async function createEmployeeWithRole(
//     data: any,
//     roleName: string,
//     empId: string,
//     roleId: string,
//     permissions: string[] = []
//   ) {
//     // Generate Number
//     const counter = await CounterModel.findOneAndUpdate(
//       { name: 'employeeNumber' },
//       { $inc: { value: 1 } },
//       { new: true, upsert: true }
//     );
//     const num = counter.value + 1000;
//     const empNum = `EMP-${num}`;

//     //Create Profile
//     const emp = await EmployeeProfileModel.create({
//       _id: empId,
//       ...data,
//       employeeNumber: empNum
//     });

//     // Create System Role
//     await EmployeeSystemRoleModel.create({
//       _id: roleId,
//       employeeProfileId: emp._id,
//       roles: [roleName],
//       permissions: permissions,
//       isActive: true
//     });

//     console.log(`Created ${data.firstName} ${data.lastName} (${roleName}) as ${empNum}`);
//     return emp;
//   }

// export const employees = [
//   // 1. Standard Regular Employee
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Alice',
//     lastName: 'Standard',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561', // HR
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 2. High Earner (Tax/Insurance Max)
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Bob',
//     lastName: 'HighSalary',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f', // Engineering
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 3. Low Earner (Tax/Insurance Min)
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Charlie',
//     lastName: 'LowSalary',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561', // HR
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 4. Department Head
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Diana',
//     lastName: 'DeptHead',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f', // Engineering
//     role: SystemRole.DEPARTMENT_HEAD,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 5. New Hire Mid-Month
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Evan',
//     lastName: 'NewHire',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561', // HR
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//     dateOfHire: new Date('2025-12-15'),
//   },
//   // 6. Termination Mid-Month
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Fiona',
//     lastName: 'Terminated',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f', // Engineering
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.TERMINATED,
//     contractEndDate: new Date('2025-12-20'),
//   },
//   // 7. Boundary Start Date
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'George',
//     lastName: 'StartBoundary',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//     dateOfHire: new Date('2025-12-01'),
//   },
//   // 8. Boundary End Date
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Hannah',
//     lastName: 'EndBoundary',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//     contractEndDate: new Date('2025-12-31'),
//   },
//   // 9. Extreme Proration (1 Day)
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Ian',
//     lastName: 'OneDay',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//     dateOfHire: new Date('2025-12-31'),
//     contractEndDate: new Date('2025-12-31'),
//   },
//   // 10. Bonus Receiver
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Jane',
//     lastName: 'Bonus',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 11. Multiple Bonuses
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Kevin',
//     lastName: 'MultiBonus',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 12. Refund Receiver
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Laura',
//     lastName: 'Refund',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 13. Allowance Receiver
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Mike',
//     lastName: 'Allowance',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 14. Kitchen Sink Earnings (Bonus + Refund + Allowances)
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Nina',
//     lastName: 'FullPackage',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 15. Penalty Target
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Oscar',
//     lastName: 'Penalty',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 16. Multiple Penalties
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Pam',
//     lastName: 'MultiPenalty',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 17. Unpaid Leave
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Quentin',
//     lastName: 'UnpaidLeave',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 18. Missing Bank Details
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Rachel',
//     lastName: 'NoBank',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//     bankAccountNumber: null,
//   },
//   // 19. Negative Net Pay Potential
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Steve',
//     lastName: 'NegativePay',
//     primaryDepartmentId: '69275ddefc1184a3b3e6c561',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
//   // 20. Salary Spike (Raise Check)
//   {
//     _id: new Types.ObjectId(),
//     firstName: 'Tina',
//     lastName: 'SalarySpike',
//     primaryDepartmentId: '69275d8afc1184a3b3e6c55f',
//     role: SystemRole.DEPARTMENT_EMPLOYEE,
//     status: EmployeeStatus.ACTIVE,
//   },
// ];


//   // ------------------------------
//   // PAY GRADES
//   // ------------------------------
//   await PayGradeModel.insertMany([
//     { grade: 'Junior', baseSalary: 3000, grossSalary: 3000, status: ConfigStatus.APPROVED },
//     { grade: 'Mid', baseSalary: 6000, grossSalary: 6000, status: ConfigStatus.APPROVED },
//     { grade: 'Senior', baseSalary: 12000, grossSalary: 12000, status: ConfigStatus.APPROVED },
//   ]);

//   // ------------------------------
//   // TAX RULE
//   // ------------------------------
//   await TaxRulesModel.create({
//     name: 'Income Tax 10%',
//     rate: 10,
//     status: ConfigStatus.APPROVED,
//   });

//   // ------------------------------
//   // INSURANCE
//   // ------------------------------
//   await InsuranceModel.insertMany([
//     { name: 'Social Insurance', minSalary: 1000, maxSalary: 8000, employeeRate: 11, employerRate: 18, amount: 0, status: ConfigStatus.APPROVED },
//     { name: 'Medical Insurance', minSalary: 0, maxSalary: 10000, employeeRate: 3, employerRate: 5, amount: 0, status: ConfigStatus.APPROVED },
//   ]);

//   // ------------------------------
//   // ALLOWANCES
//   // ------------------------------
//   await AllowanceModel.insertMany([
//     { name: 'Housing Allowance', amount: 1000, status: ConfigStatus.APPROVED },
//     { name: 'Transport Allowance', amount: 500, status: ConfigStatus.APPROVED },
//   ]);

//   // ------------------------------
//   // SIGNING BONUSES
//   // ------------------------------
//   await SigningBonusModel.insertMany([
//     { employeeId: employees[9], signingBonusId: new Types.ObjectId(), givenAmount: 2000, status: BonusStatus.PENDING },
//     { employeeId: employees[10], signingBonusId: new Types.ObjectId(), givenAmount: 1000, status: BonusStatus.PENDING },
//     { employeeId: employees[10], signingBonusId: new Types.ObjectId(), givenAmount: 1500, status: BonusStatus.PENDING },
//     { employeeId: employees[13], signingBonusId: new Types.ObjectId(), givenAmount: 3000, status: BonusStatus.PENDING },
//   ]);

//   // ------------------------------
//   // REFUNDS
//   // ------------------------------
//   await RefundsModel.insertMany([
//     { employeeId: employees[11], refundDetails: { description: 'Expense Claim', amount: 800 }, status: RefundStatus.PENDING },
//     { employeeId: employees[13], refundDetails: { description: 'Travel Reimbursement', amount: 500 }, status: RefundStatus.PENDING },
//   ]);

//   // ------------------------------
//   // PENALTIES
//   // ------------------------------
//   await PenaltiesModel.insertMany([
//     { employeeId: employees[14], penalties: [{ reason: 'Lateness', amount: 300 }] },
//     { employeeId: employees[15], penalties: [{ reason: 'Lateness', amount: 200 }, { reason: 'Misconduct', amount: 500 }] },
//     { employeeId: employees[18], penalties: [{ reason: 'Severe Violation', amount: 7000 }] },
//   ]);

//   // ------------------------------
//   // LEAVE REQUESTS
//   // ------------------------------
//   await LeaveRequestModel.create({
//     employeeId: employees[16],
//     leaveTypeId: new Types.ObjectId(),
//     dates: { from: new Date('2025-05-10'), to: new Date('2025-05-12') },
//     durationDays: 3,
//     status: LeaveStatus.APPROVED,
//   });

//   console.log('✅ Payroll dummy data inserted successfully');

//   // ------------------------------
//   // OPTIONAL: Link Employees to Payroll (Example)
//   // ------------------------------
//   // Here you can also insert EmployeeProfile documents if needed
//   // await EmployeeProfile.insertMany(employees.map((id, i) => ({
//   //   _id: id,
//   //   firstName: `Emp${i + 1}`,
//   //   lastName: 'Test',
//   //   dateOfHire: new Date(),
//   //   status: 'ACTIVE'
//   // })));

//   process.exit(0);
// }

// main().catch(err => {
//   console.error('❌ Seed failed', err);
//   process.exit(1);
// });
