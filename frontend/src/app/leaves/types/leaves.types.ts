/**
 * TypeScript interfaces for API responses and domain models
 * src/app/leaves/types/leaves.types.ts
 * 
 * ✅ UPDATED TO MATCH BACKEND SCHEMA
 */
import { LeaveStatus, AttachmentType, ApprovalRole, ApprovalStatus, RoundingRule, AccrualMethod, AdjustmentType } from './leaves.enums';

// Type alias for MongoDB ObjectId as string
export type ObjectId = string;

// ---------- Core Domain Models ----------

/**
 * Leave Type (matches backend LeaveType schema)
 * ✅ FIXED: Changed 'paid' to 'paidLeave'
 * ✅ ADDED: requiresApproval, maxConsecutiveDays
 */
export interface LeaveType {
  _id: ObjectId;
  code: string;
  name: string;
  categoryId: ObjectId | {
    _id: ObjectId;
    name: string;
    description?: string;
  };
  // Populated category (when using .populate())
  category?: {
    _id: ObjectId;
    name: string;
    description?: string;
  };
  description?: string;
  paidLeave: boolean;  // ✅ FIXED: Was 'paid'
  deductible: boolean;
  requiresAttachment: boolean;
  attachmentType?: AttachmentType;
  requiresApproval?: boolean;  // ✅ ADDED
  minTenureMonths?: number;
  maxDurationDays?: number;
  maxConsecutiveDays?: number;  // ✅ ADDED
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Leave Request Date Range
 */
export interface LeaveRequestDates {
  from: string; // ISO date string
  to: string; // ISO date string
}

/**
 * Approval Flow Step
 */
export interface ApprovalFlowStep {
  role: ApprovalRole;
  level: number;  // ✅ ADDED (backend has this)
  status: ApprovalStatus;
  decidedBy?: ObjectId;
  decidedAt?: string;
  comments?: string;
  reason?: string;
}

/**
 * Finalization Details
 */
export interface FinalizationDetails {
  paidDays: number;
  unpaidDays: number;
  finalizedBy: ObjectId;
  finalizedAt: string;
  comments?: string;
  integrationData?: {
    payrollPeriod: string;
    deductionCode: string;
  };
}

/**
 * Leave Request
 */
export interface LeaveRequest {
  _id: ObjectId;
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  leaveType?: LeaveType;
  dates: LeaveRequestDates;
  durationDays: number;
  justification?: string;
  attachmentId?: ObjectId;
  attachment?: Attachment;
  approvalFlow: ApprovalFlowStep[];
  status: LeaveStatus;
  irregularPatternFlag: boolean;
  finalizationDetails?: FinalizationDetails;
  createdAt: string;
  updatedAt: string;
}

/**
 * Attachment/Document
 */
export interface Attachment {
  _id: ObjectId;
  type: AttachmentType;
  filename: string;
  url: string;
  uploadedAt: string;
  verifiedBy?: ObjectId;
  verifiedAt?: string;
}

/**
 * Leave Entitlement
 * ✅ FIXED: Updated to match backend schema exactly
 */
export interface LeaveEntitlement {
  _id: ObjectId;
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  leaveType?: LeaveType;
  
  // Backend field names (flat structure, not nested)
  yearlyEntitlement: number;    // ✅ FIXED: Was 'totalEntitlement'
  accruedActual: number;        // ✅ ADDED
  accruedRounded: number;       // ✅ ADDED
  carryForward: number;         // ✅ FIXED: Was 'carriedOver'
  taken: number;                // ✅ FIXED: Was 'used'
  pending: number;
  remaining: number;            // ✅ FIXED: Was 'available'
  
  // Optional fields
  nextResetDate?: string;       // ✅ ADDED
  lastAccrualDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Leave Adjustment
 */
export interface LeaveAdjustment {
  _id: ObjectId;
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  adjustmentType: AdjustmentType;  // 'ADD' | 'DEDUCT'
  amount: number;
  reason: string;
  hrUserId: ObjectId;  // ✅ FIXED: Backend uses 'hrUserId' not 'approvedBy'
  createdAt: string;
  updatedAt?: string;
}

/**
 * Leave Policy Eligibility
 * ✅ UPDATED to match backend
 */
export interface LeavePolicyEligibility {
  minTenureMonths?: number;
  positionsAllowed?: string[];  // ✅ FIXED: Was 'employeeTypes'
  contractTypesAllowed?: string[];  // ✅ ADDED
  excludeEmployees?: ObjectId[];  // ✅ KEPT (backend supports this)
}

/**
 * Leave Policy Approval Chain Step
 * ✅ ADDED (backend has this)
 */
export interface LeavePolicyApprovalStep {
  role: string;
  level: number;
}

/**
 * Leave Policy
 * ✅ COMPLETELY RESTRUCTURED to match backend flat schema
 */
export interface LeavePolicy {
  _id: ObjectId;
  leaveTypeId: ObjectId;
  leaveType?: LeaveType;  // Populated
  
  // Accrual Configuration (flat, not nested)
  accrualMethod: AccrualMethod;  // 'yearly' | 'monthly'
  yearlyRate?: number;           // ✅ Annual days (if accrualMethod = 'yearly')
  monthlyRate?: number;          // ✅ Monthly accrual (if accrualMethod = 'monthly')
  
  // Carry Forward Configuration (flat, not nested)
  carryForwardAllowed: boolean;  // ✅ NOT carryover.allowCarryover
  maxCarryForward?: number;      // ✅ NOT carryover.maxCarryoverDays
  carryForwardExpiryMonths?: number;
  
  // Rounding & Limits (flat, not nested)
  roundingRule: RoundingRule;    // 'NONE' | 'ARITHMETIC' | 'ALWAYS_UP' | 'ALWAYS_DOWN'
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  
  // Approval & Eligibility
  approvalChain?: LeavePolicyApprovalStep[];
  eligibility?: LeavePolicyEligibility;
  
  // Document Rules
  requiresDocumentAboveDays?: number;
  
  // Dates
  effectiveDate: string;
  expiryDate?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Holiday
 */
export interface Holiday {
  _id: ObjectId;
  name: string;
  date: string;
  calendarId?: ObjectId;  // ✅ ADDED (backend has this)
  isRecurring?: boolean;   // ✅ ADDED
  type?: 'PUBLIC' | 'OPTIONAL';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Calendar Blocked Period
 */
export interface CalendarBlockedPeriod {
  _id?: string;  // ✅ ADDED (backend generates this)
  name?: string; // ✅ ADDED (backend has this)
  from: string;
  to: string;
  reason?: string;
}

/**
 * Calendar
 */
export interface Calendar {
  _id: ObjectId;
  year?: number;
  name?: string;  // ✅ ADDED
  code?: string;  // ✅ ADDED
  country?: string;  // ✅ ADDED
  
  // Weekend configuration
  weekendDays?: number[];  // ✅ ADDED (0=Sunday, 6=Saturday)
  
  // Holidays can be IDs or populated objects
  holidays?: Array<Holiday | ObjectId>;
  blockedPeriods?: CalendarBlockedPeriod[];
  
  workingDaysPerWeek?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- API Response Models ----------

/**
 * My Balances Response
 */
export interface MyBalancesResponse {
  entitlements: LeaveEntitlement[];
  totalUsed: number;
  totalAvailable: number;
}

/**
 * My History Entry
 */
export interface MyHistoryEntry {
  request: LeaveRequest;
  leaveType: LeaveType;
}

/**
 * My History Response
 */
export interface MyHistoryResponse {
  requests: MyHistoryEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Employee Balance (alias for TeamBalanceMember)
 */
export type EmployeeBalance = TeamBalanceMember;

/**
 * Team Balance Member
 */
export interface TeamBalanceMember {
  employeeId: ObjectId;
  employeeName: string;
  employeeNumber: string;
  entitlements: LeaveEntitlement[];
}

/**
 * Team Balances Response
 */
export interface TeamBalancesResponse {
  teamMembers: TeamBalanceMember[];
}

/**
 * Team History Response
 */
export interface TeamHistoryResponse {
  requests: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

/**
 * All Requests Response
 */
export interface AllRequestsResponse {
  requests: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Policies Response
 */
export interface PoliciesResponse {
  policies: LeavePolicy[];
  total: number;
}

/**
 * Flag Irregular Response
 */
export interface FlagIrregularResponse {
  message: string;
  request: LeaveRequest;
}

/**
 * Verify Medical Response
 */
export interface VerifyMedicalResponse {
  message: string;
  attachment: Attachment;
}

/**
 * Accrual Job Response
 */
export interface AccrualJobResponse {
  message: string;
  processedCount: number;
}

/**
 * Carry Forward Job Response
 */
export interface CarryForwardJobResponse {
  message: string;
  processedCount: number;
}

/**
 * Escalation Job Response
 */
export interface EscalationJobResponse {
  message: string;
  escalatedCount: number;
}

/**
 * Integration Details Response
 */
export interface IntegrationDetailsResponse {
  requestId: ObjectId;
  payrollIntegration?: {
    payrollPeriod: string;
    deductionCode: string;
    status: string;
  };
}

/**
 * HR Metrics
 */
export interface HrMetrics {
  totalRequests: number;
  pendingApprovals: number;
  awaitingFinalization: number;
  irregularPatterns: number;
  unverifiedDocuments: number;
}

// ---------- Helper Types for Frontend Display ----------

/**
 * Computed Entitlement Display (for UI compatibility)
 * Maps backend fields to legacy frontend field names
 */
export interface EntitlementDisplay {
  _id: ObjectId;
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  leaveType?: LeaveType;
  
  // Computed/mapped fields for backward compatibility
  totalEntitlement: number;  // Maps to yearlyEntitlement
  used: number;              // Maps to taken
  available: number;         // Maps to remaining
  carriedOver: number;       // Maps to carryForward
  pending: number;
  
  // Original backend fields (optional, for advanced displays)
  accruedActual?: number;
  accruedRounded?: number;
}

/**
 * Helper function to convert backend entitlement to display format
 */
export function mapEntitlementToDisplay(entitlement: LeaveEntitlement): EntitlementDisplay {
  return {
    _id: entitlement._id,
    employeeId: entitlement.employeeId,
    leaveTypeId: entitlement.leaveTypeId,
    leaveType: entitlement.leaveType,
    totalEntitlement: entitlement.yearlyEntitlement,
    used: entitlement.taken,
    available: entitlement.remaining,
    carriedOver: entitlement.carryForward,
    pending: entitlement.pending,
    accruedActual: entitlement.accruedActual,
    accruedRounded: entitlement.accruedRounded,
  };
}

/**
 * Computed Policy Display (for UI compatibility)
 * Maps backend flat structure to legacy nested structure
 */
export interface PolicyDisplay {
  _id: ObjectId;
  leaveTypeId: ObjectId;
  leaveType?: LeaveType;
  effectiveDate: string;
  
  // Computed nested objects for backward compatibility
  entitlement: {
    annualDays: number;      // Maps to yearlyRate
    accruedMonthly: boolean; // Maps to accrualMethod === 'monthly'
    accrualRate?: number;    // Maps to monthlyRate
  };
  carryover: {
    allowCarryover: boolean; // Maps to carryForwardAllowed
    maxCarryoverDays?: number; // Maps to maxCarryForward
    expiryMonths?: number;   // Maps to carryForwardExpiryMonths
  };
  
  // Original backend fields (optional)
  accrualMethod?: AccrualMethod;
  roundingRule?: RoundingRule;
}

/**
 * Helper function to convert backend policy to display format
 */
export function mapPolicyToDisplay(policy: LeavePolicy): PolicyDisplay {
  return {
    _id: policy._id,
    leaveTypeId: policy.leaveTypeId,
    leaveType: policy.leaveType,
    effectiveDate: policy.effectiveDate,
    entitlement: {
      annualDays: policy.accrualMethod === 'yearly' 
        ? (policy.yearlyRate ?? 0) 
        : (policy.monthlyRate ?? 0) * 12,
      accruedMonthly: policy.accrualMethod === 'monthly',
      accrualRate: policy.monthlyRate,
    },
    carryover: {
      allowCarryover: policy.carryForwardAllowed,
      maxCarryoverDays: policy.maxCarryForward,
      expiryMonths: policy.carryForwardExpiryMonths,
    },
    accrualMethod: policy.accrualMethod,
    roundingRule: policy.roundingRule,
  };
}
