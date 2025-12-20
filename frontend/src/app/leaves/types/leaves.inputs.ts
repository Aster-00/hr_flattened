/**
 * TypeScript types for form inputs
 * src/app/leaves/types/leaves.inputs.ts
 */
import { LeaveStatus, AttachmentType, RoundingRule } from './leaves.enums';
import { LeaveRequestDates, ObjectId } from './leaves.types';

// ---------- Leave Request Inputs ----------

/**
 * Create Leave Request Input
 */
export interface CreateLeaveRequestInput {
  leaveTypeId: ObjectId;
  fromDate: string;
  toDate: string;
  durationDays: number;
  justification?: string;
  attachmentId?: ObjectId;
  convertUnpaidDays?: boolean;
  unpaidDaysCount?: number;
}

/**
 * Update Leave Request Input
 */
export interface UpdateLeaveRequestInput {
  dates?: LeaveRequestDates;
  justification?: string;
  attachmentId?: ObjectId;
}

/**
 * Manager Approval Input
 */
export interface ManagerApprovalInput {
  comments?: string;
}

/**
 * Manager Rejection Input
 */
export interface ManagerRejectionInput {
  reason: string;
  comments?: string;
}

/**
 * Return for Correction Input
 */
export interface ReturnForCorrectionInput {
  reason: string;
  comment?: string;
}

/**
 * HR Finalize Input
 */
export interface HRFinalizeInput {
  paidDays: number;
  unpaidDays: number;
  comments?: string;
  integrationData?: {
    payrollPeriod: string;
    deductionCode: string;
  };
}

/**
 * HR Override Input
 */
export interface HROverrideInput {
  overrideReason: string;
  comments?: string;
  paidDays?: number;
  unpaidDays?: number;
}

/**
 * Bulk Process Input
 */
export interface BulkProcessInput {
  requestIds: ObjectId[];
  action: 'APPROVE' | 'REJECT' | 'FINALIZE';
  comments?: string;
}

// ---------- Query Inputs ----------

/**
 * Balance Query Input
 */
export interface BalanceQueryInput {
  year?: number;
  leaveTypeId?: ObjectId;
}

/**
 * My Balances Query
 */
export interface MyBalancesQuery {
  year?: number;
  leaveTypeId?: ObjectId;
}

/**
 * History Filter Input
 */
export interface HistoryFilterInput {
  startDate?: string;
  endDate?: string;
  leaveTypeId?: ObjectId;
  status?: LeaveStatus;
  page?: number;
  limit?: number;
}

/**
 * My History Query
 */
export interface MyHistoryQuery {
  startDate?: string;
  endDate?: string;
  leaveTypeId?: ObjectId;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Team Balances Query
 */
export interface TeamBalancesQuery {
  year?: number;
  departmentId?: ObjectId;
}

/**
 * Team History Query
 */
export interface TeamHistoryQuery {
  startDate?: string;
  endDate?: string;
  leaveTypeId?: ObjectId;
  status?: string;
  employeeId?: ObjectId;
  page?: number;
  limit?: number;
}

/**
 * Flag Irregular Input
 */
export interface FlagIrregularInput {
  requestId: ObjectId;
}

/**
 * Verify Medical Input
 */
export interface VerifyMedicalInput {
  requestId: ObjectId;
  verified: boolean;
  comments?: string;
}

// ---------- Leave Type & Policy Inputs ----------

/**
 * Create Leave Type Input (matches backend CreateLeaveTypeDto)
 */
export interface CreateLeaveTypeInput {
  code: string;
  name: string;
  categoryId: ObjectId;
  description?: string;
  paid: boolean;
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: AttachmentType;
  minTenureMonths?: number;
  maxDurationDays?: number;
}

/**
 * Update Leave Type Input
 */
export type UpdateLeaveTypeInput = Partial<Omit<CreateLeaveTypeInput, 'categoryId'>>;

/**
 * Create Leave Policy Input
 */
export interface CreateLeavePolicyInput {
  leaveTypeId: ObjectId;
  effectiveDate: string;
  expiryDate?: string;
  entitlement: {
    annualDays: number;
    accruedMonthly: boolean;
    accrualRate?: number;
  };
  carryover: {
    allowCarryover: boolean;
    maxCarryoverDays?: number;
    expiryMonths?: number;
  };
  rounding: {
    rule: RoundingRule;
    minUnit?: number;
  };
  eligibility: {
    minTenureMonths?: number;
    employeeTypes?: string[];
    departments?: ObjectId[];
    excludeEmployees?: ObjectId[];
  };
  documentRules: {
    requiresDocumentAboveDays?: number;
  };
}

/**
 * Update Leave Policy Input
 */
export type UpdateLeavePolicyInput = Partial<CreateLeavePolicyInput>;

/**
 * File Upload Input
 */
export interface FileUploadInput {
  file: File;
  type: AttachmentType;
  leaveRequestId?: ObjectId;
}
