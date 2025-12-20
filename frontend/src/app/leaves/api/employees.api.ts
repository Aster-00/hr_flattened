import { leavesApiClient } from './leaves.client';

/**
 * Complete Employee interface matching backend EmployeeProfile schema
 * Includes fields from UserProfileBase + EmployeeProfile
 */
export interface Employee {
  // MongoDB ID
  _id: string;

  // From UserProfileBase (inherited fields)
  firstName: string;
  lastName: string;
  fullName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  phone?: string;
  mobilePhone?: string;
  email?: string;
  personalEmail?: string;
  profilePictureUrl?: string;
  roles?: string[];
  address?: {
    streetAddress?: string;
    city?: string;
    country?: string;
  };

  // Core EmployeeProfile fields
  employeeNumber: string;           // Unique HR/Payroll number
  employeeId: string;                // Alias for employeeNumber (for compatibility)
  dateOfHire: string;
  workEmail?: string;
  biography?: string;
  
  // Contract details
  contractStartDate?: string;
  contractEndDate?: string;
  contractType?: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'INTERNSHIP';
  workType?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'ON_LEAVE';
  statusEffectiveFrom?: string;

  // Banking
  bankName?: string;
  bankAccountNumber?: string;

  // Organization Structure References
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  supervisorPositionId?: string;
  payGradeId?: string;

  // Performance/Appraisal
  lastAppraisalRecordId?: string;
  lastAppraisalCycleId?: string;
  lastAppraisalTemplateId?: string;
  lastAppraisalDate?: string;
  lastAppraisalScore?: number;
  lastAppraisalRatingLabel?: string;
  lastAppraisalScaleType?: string;
  lastDevelopmentPlanSummary?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch all employees from the backend
 * Maps employeeNumber to employeeId for compatibility with existing code
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await leavesApiClient.get('/employee-profile');
  const employees = response.data;
  
  // Ensure employeeId exists (mapped from employeeNumber)
  return employees.map((emp: any) => ({
    ...emp,
    employeeId: emp.employeeNumber || emp.employeeId,
    fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`
  }));
};

/**
 * Fetch single employee by ID
 */
export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await leavesApiClient.get(`/employee-profile/${id}`);
  const emp = response.data;
  
  return {
    ...emp,
    employeeId: emp.employeeNumber || emp.employeeId,
    fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`
  };
};

/**
 * Fetch employees by department
 */
export const getEmployeesByDepartment = async (departmentId: string): Promise<Employee[]> => {
  const response = await leavesApiClient.get(`/employee-profile?primaryDepartmentId=${departmentId}`);
  const employees = response.data;
  
  return employees.map((emp: any) => ({
    ...emp,
    employeeId: emp.employeeNumber || emp.employeeId,
    fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`
  }));
};
