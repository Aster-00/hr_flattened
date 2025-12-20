
import mongoose from 'mongoose';
import { Department, DepartmentSchema } from '../../organization-structure/Models/department.schema';
import { Position, PositionSchema } from '../../organization-structure/Models/position.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../Models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleSchema } from '../Models/employee-system-role.schema';
import { EmployeeStatus, ContractType, WorkType, SystemRole } from '../enums/employee-profile.enums';

import { Counter, CounterSchema } from '../Models/counter.schema';

async function main() {
  await mongoose.connect(
    'mongodb+srv://kanzy:UKNASQYpMP8fhSfS@hrcuster.fqiw4vw.mongodb.net/employee-profile-test?retryWrites=true&w=majority'
  );
  console.log('Connected to MongoDB');

  // Register Models
  const CounterModel = mongoose.model('Counter', CounterSchema);
  const DepartmentModel = mongoose.model('Department', DepartmentSchema);
  const PositionModel = mongoose.model('Position', PositionSchema);
  // EmployeeProfile and EmployeeSystemRole refer to each other or other schemas, 
  // ensuring proper model registration is crucial if using `ref`.
  // The schemas usually try to use `mongoose.model` or similar. 
  // To avoid `OverwriteModelError`, we check if it exists.
  const EmployeeProfileModel = mongoose.models.EmployeeProfile || mongoose.model(EmployeeProfile.name, EmployeeProfileSchema);
  const EmployeeSystemRoleModel = mongoose.models.EmployeeSystemRole || mongoose.model(EmployeeSystemRole.name, EmployeeSystemRoleSchema);

  // Clear existing data
  // console.log('Clearing old data...');
  // await Promise.all([
  //   DepartmentModel.deleteMany({}),
  //   PositionModel.deleteMany({}),
  //   EmployeeProfileModel.deleteMany({}),
  //   EmployeeSystemRoleModel.deleteMany({}),
  //   CounterModel.deleteMany({}),
  // ]);


  //console.log('Collections cleared');

  // Drop obsolete indexes that may conflict
  console.log('Dropping obsolete indexes...');
  try {
    await DepartmentModel.collection.dropIndex('departmentId_1');
    console.log('Dropped departmentId_1 index');
  } catch (err: any) {
    if (err.code !== 27) { // 27 = IndexNotFound
      console.log('departmentId_1 index does not exist (this is fine)');
    }
  }


  // ------------------------------
  // 1. Create Departments
  // ------------------------------
  // console.log('Creating Departments...');

  // const itDeptId = '694198758b926cc38a8ccd87';
  const hrDeptId = '694198758b926cc38a8cc111';
  // const finDeptId = '694198758b926cc38a8cc222';
  //const payrollDeptId = '694198758b926cc38a8cc333';

  // const departments = [
  //   //   { _id: itDeptId, code: 'IT-DEP', name: 'IT Department', isActive: true },
  //   //   { _id: hrDeptId, code: 'HR-DEP', name: 'HR Department', isActive: true },
  //   //   { _id: finDeptId, code: 'FIN-DEP', name: 'Finance Department', isActive: true },

  //   //{ _id: payrollDeptId, code: 'PAYROLL-DEP', name: 'Payroll Department', isActive: true },
  // ];

  // for (const d of departments) {
  //   await DepartmentModel.create(d);
  // }

  // ------------------------------
  // 2. Create Positions
  // ------------------------------
  // console.log('Creating Positions...');

  // // IT Positions
  // const itMgrPosId = '694191cd6b4c02774a830580';
  // const itEmpPosId = '694191cd6b4c02774a830581';

  // // HR Positions
  // const hrMgrPosId = '694191cd6b4c02774a830590';
  // const recruiterPosId = '694191cd6b4c02774a830591';

  // // Finance Positions
  // const finMgrPosId = '694191cd6b4c02774a830600';
  const finEmpPosId = '694191cd6b4c02774a830601';

  // const positions = [
  //   { _id: itMgrPosId, title: 'IT Manager', code: 'IT-MGR', departmentId: itDeptId, isActive: true },
  //   { _id: itEmpPosId, title: 'Software Engineer', code: 'IT-SE', departmentId: itDeptId, isActive: true, reportsToPositionId: itMgrPosId },

  //   { _id: hrMgrPosId, title: 'HR Manager', code: 'HR-MGR', departmentId: hrDeptId, isActive: true },
  //   { _id: recruiterPosId, title: 'Recruiter', code: 'HR-REC', departmentId: hrDeptId, isActive: true, reportsToPositionId: hrMgrPosId },

  //   { _id: finMgrPosId, title: 'Finance Manager', code: 'FIN-MGR', departmentId: finDeptId, isActive: true },
  //   { _id: finEmpPosId, title: 'Finance Specialist', code: 'FIN-SPC', departmentId: finDeptId, isActive: true, reportsToPositionId: finMgrPosId },
  // ];

  // for (const p of positions) {
  //   await PositionModel.create(p);
  // }


  // ------------------------------
  // Helper: Create Employee & Role
  // ------------------------------
  // ------------------------------
  // Helper: Create Employee & Role
  // ------------------------------
  async function createEmployeeWithRole(
    data: any,
    roleName: string,
    empId: string,
    roleId: string,
    permissions: string[] = []
  ) {
    // Generate Number
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'employeeNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const num = counter.value + 1000;
    const empNum = `EMP-${num}`;

    //Create Profile
    const emp = await EmployeeProfileModel.create({
      _id: empId,
      ...data,
      employeeNumber: empNum
    });

    // Create System Role
    await EmployeeSystemRoleModel.create({
      _id: roleId,
      employeeProfileId: emp._id,
      roles: [roleName],
      permissions: permissions,
      isActive: true
    });

    console.log(`Created ${data.firstName} ${data.lastName} (${roleName}) as ${empNum}`);
    return emp;
  }

  // // ------------------------------
  // // 3. Create Employees
  // // ------------------------------
  console.log('Creating Employees...');

  const commonData = {
    password: "password123",
    contractType: ContractType.FULL_TIME_CONTRACT,
    workType: WorkType.FULL_TIME,
    dateOfHire: new Date("2024-01-01"),
    status: EmployeeStatus.ACTIVE,
  };

  // //1. IT Manager(Dept Head) - Using user provided IDs
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "it", lastName: "manager",
  //   nationalId: "26599767100345",
  //   personalEmail: "it.manager@personal.com",
  //   mobilePhone: "01011223334",
  //   workEmail: "it.manager@example.com",
  //   primaryPositionId: itMgrPosId,
  //   primaryDepartmentId: itDeptId,
  // }, SystemRole.DEPARTMENT_HEAD,
  //   "6941b474fe0b7313027848cf", // Employee ID
  //   "6941b474fe0b7313027848d1"  // Role ID
  // );

  // // 2. HR Manager
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "HR", lastName: "Manager",
  //   nationalId: "28001010000001",
  //   personalEmail: "hr.manager@personal.com",
  //   mobilePhone: "01000000001",
  //   workEmail: "hr.manager@example.com",
  //   primaryPositionId: hrMgrPosId,
  //   primaryDepartmentId: hrDeptId,
  // }, SystemRole.HR_MANAGER,
  //   "6941b474fe0b7313027848d2",
  //   "6941b474fe0b7313027848d3"
  // );

  // // 3. Recruiter
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "Recruiter", lastName: "One",
  //   nationalId: "28001010000002",
  //   personalEmail: "recruiter@personal.com",
  //   mobilePhone: "01000000002",
  //   workEmail: "recruiter@example.com",
  //   primaryPositionId: recruiterPosId,
  //   primaryDepartmentId: hrDeptId,
  // }, SystemRole.RECRUITER,
  //   "6941b474fe0b7313027848d4",
  //   "6941b474fe0b7313027848d5"
  // );

  // // 4. Finance Manager (Dept Head)
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "Finance", lastName: "Manager",
  //   nationalId: "28001010000003",
  //   personalEmail: "fin.manager@personal.com",
  //   mobilePhone: "01000000003",
  //   workEmail: "fin.manager@example.com",
  //   primaryPositionId: finMgrPosId,
  //   primaryDepartmentId: finDeptId,
  // }, SystemRole.DEPARTMENT_HEAD,
  //   "6941b474fe0b7313027848d6",
  //   "6941b474fe0b7313027848d7"
  // );

  // // 5. Finance Employee
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "Finance", lastName: "Employee",
  //   nationalId: "28001010000004",
  //   personalEmail: "fin.emp@personal.com",
  //   mobilePhone: "01000000004",
  //   workEmail: "fin.emp@example.com",
  //   primaryPositionId: finEmpPosId,
  //   primaryDepartmentId: finDeptId,
  // }, SystemRole.FINANCE_STAFF,
  //   "6941b474fe0b7313027848d8",
  //   "6941b474fe0b7313027848d9"
  // );

  // // 6. IT Employee 1
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "IT", lastName: "Employee1",
  //   nationalId: "28001010000005",
  //   personalEmail: "it.emp1@personal.com",
  //   mobilePhone: "01000000005",
  //   workEmail: "it.emp1@example.com",
  //   primaryPositionId: itEmpPosId,
  //   primaryDepartmentId: itDeptId,
  // }, SystemRole.DEPARTMENT_EMPLOYEE,
  //   "6941b474fe0b7313027848da",
  //   "6941b474fe0b7313027848db"
  // );

  // // 7. IT Employee 2
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "IT", lastName: "Employee2",
  //   nationalId: "28001010000006",
  //   personalEmail: "it.emp2@personal.com",
  //   mobilePhone: "01000000006",
  //   workEmail: "it.emp2@example.com",
  //   primaryPositionId: itEmpPosId,
  //   primaryDepartmentId: itDeptId,
  // }, SystemRole.DEPARTMENT_EMPLOYEE,
  //   "6941b474fe0b7313027848dc",
  //   "6941b474fe0b7313027848dd"
  // );
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "finance", lastName: "staff",
  //   nationalId: "28001010000008",
  //   personalEmail: "finance.staff@personal.com",
  //   mobilePhone: "01011223335",
  //   workEmail: "finance.staff@example.com",
  //   //primaryPositionId: itMgrPosId,
  //   primaryDepartmentId: finDeptId,
  // }, SystemRole.FINANCE_STAFF,
  //   "6941b474fe0b7313027848de", // Employee ID
  //   "6941b474fe0b7313027848df"  // Role ID
  // );

  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "payroll", lastName: "manager",
  //   nationalId: "28001010000009",
  //   personalEmail: "payroll.manager@personal.com",
  //   mobilePhone: "01011223335",
  //   workEmail: "payroll.manager@example.com",
  //   //primaryPositionId: itMgrPosId,
  //   primaryDepartmentId: payrollDeptId,
  // }, SystemRole.PAYROLL_MANAGER,
  //   "6941b474fe0b7313027848e0", // Employee ID
  //   "6941b474fe0b7313027848e1"  // Role ID
  // );

  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "payroll", lastName: "specialist",
  //   nationalId: "28001010000010",
  //   personalEmail: "payroll.specialist@personal.com",
  //   mobilePhone: "01011223335",
  //   workEmail: "payroll.specialist@example.com",
  //   //primaryPositionId: itMgrPosId,
  //   primaryDepartmentId: payrollDeptId,
  // }, SystemRole.PAYROLL_SPECIALIST,
  //   "6941b474fe0b7355627848e2", // Employee ID
  //   "6941b474fe0b7355627848e3"  // Role ID
  // );
  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "payroll", lastName: "specialist2",
  //   nationalId: "28001010000012",
  //   personalEmail: "payroll.specialist2@personal.com",
  //   mobilePhone: "01011223336",
  //   workEmail: "payroll.specialist2@example.com",
  //   //primaryPositionId: itMgrPosId,
  //   primaryDepartmentId: payrollDeptId,
  // }, SystemRole.PAYROLL_SPECIALIST,
  //   "6941b474fe0b7313027848e4", // Employee ID - Fixed to 24 chars
  //   "6941b474fe0b7313027848e5"  // Role ID - Fixed to 24 chars
  // );

  // await createEmployeeWithRole({
  //   ...commonData,
  //   firstName: "hr", lastName: "admin",
  //   nationalId: "28001010000011",
  //   personalEmail: "hr.admin@personal.com",
  //   mobilePhone: "01011223337",
  //   workEmail: "hr.admin@example.com",
  //   //primaryPositionId: hrMgrPosId,
  //   primaryDepartmentId: hrDeptId,
  // }, SystemRole.HR_ADMIN,
  //   "6941b474fe0b7313027848e6", // Employee ID - Fixed to 24 chars
  //   "6941b474fe0b7313027848e7"  // Role ID - Fixed to 24 chars
  // );

  await createEmployeeWithRole({
    ...commonData,
    firstName: "deactivate", lastName: "one",
    nationalId: "28001010000015",
    personalEmail: "deactivate.one@personal.com",
    mobilePhone: "01011223337",
    workEmail: "deactivate.one@example.com",
    //primaryPositionId: hrMgrPosId,
    //primaryDepartmentId: finEmpPosId,
  }, SystemRole.DEPARTMENT_EMPLOYEE,
    "6941b474fe0b6767667848e6", // Employee ID - Fixed to 24 chars
    "6941b474fe456713027848e7"  // Role ID - Fixed to 24 chars
  );

  await createEmployeeWithRole({
    ...commonData,
    firstName: "deactivate", lastName: "two",
    nationalId: "28001010000025",
    personalEmail: "deactivate.two@personal.com",
    mobilePhone: "01011223337",
    workEmail: "deactivate.two@example.com",
    //primaryPositionId: hrMgrPosId,
    primaryDepartmentId: finEmpPosId,
  }, SystemRole.DEPARTMENT_EMPLOYEE,
    "6941b994fe0b6767667848e6", // Employee ID - Fixed to 24 chars
    "6941b994fe456713027848e7"  // Role ID - Fixed to 24 chars
  );

  console.log('Dummy data inserted!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
