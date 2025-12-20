/**
 * Leave Status Enum
 * Represents the current status of a leave request
 */
// Enums matching backend
// src/app/leaves/types/leaves.enums.ts

// Same as backend LeaveStatus enum
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  FINALIZED = 'finalized',
}

/**
 * Attachment Type Enum
 * Types of documents that can be attached to leave requests
 */
export enum AttachmentType {
  MEDICAL = 'medical',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/**
 * Adjustment Type Enum
 * Types of leave balance adjustments
 */
export enum AdjustmentType {
  ADD = 'add',
  DEDUCT = 'deduct',
  ENCASHMENT = 'encashment',
}

/**
 * Rounding Rule Enum
 * Rules for rounding leave days
 */
export enum RoundingRule {
  NONE = 'none',
  ROUND = 'round',
  ROUND_UP = 'round_up',
  ROUND_DOWN = 'round_down',
}

/**
 * Accrual Method Enum
 * Methods for accruing leave days
 */
export enum AccrualMethod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  PER_TERM = 'per-term',
}

/**
 * Approval Role Enum
 * Roles in the approval workflow
 */
export enum ApprovalRole {
  MANAGER = 'manager',
  HR = 'hr',
}

/**
 * Approval Status Enum
 * Status of an approval step
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

