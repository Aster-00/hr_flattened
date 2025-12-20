// src/app/leaves/api/policies.api.ts

import { leavesApiClient } from './leaves.client';
import { LEAVE_POLICIES_BASE } from './leaves.endpoints';
import type { LeavePolicy, RoundingRule, AccrualMethod } from '@/app/leaves/types';

// ==================== DTOs ====================

/**
 * Create Leave Policy Input (matches backend schema)
 */
export interface CreateLeavePolicyInput {
  leaveTypeId: string;
  
  // Accrual Configuration
  accrualMethod: AccrualMethod;
  yearlyRate?: number;
  monthlyRate?: number;
  
  // Carry Forward Configuration
  carryForwardAllowed: boolean;
  maxCarryForward?: number;
  carryForwardExpiryMonths?: number;
  
  // Rounding & Limits
  roundingRule: RoundingRule;
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  
  // Approval & Eligibility
  approvalChain?: Array<{
    role: string;
    level: number;
  }>;
  eligibility?: {
    minTenureMonths?: number;
    positionsAllowed?: string[];
    contractTypesAllowed?: string[];
    excludeEmployees?: string[];
  };
  
  // Document Rules
  requiresDocumentAboveDays?: number;
  
  // Dates
  effectiveDate: string;
  expiryDate?: string;
}

/**
 * Update Leave Policy Input (all fields optional)
 */
export interface UpdateLeavePolicyInput {
  leaveTypeId?: string;
  
  // Accrual Configuration
  accrualMethod?: AccrualMethod;
  yearlyRate?: number;
  monthlyRate?: number;
  
  // Carry Forward Configuration
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  carryForwardExpiryMonths?: number;
  
  // Rounding & Limits
  roundingRule?: RoundingRule;
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  
  // Approval & Eligibility
  approvalChain?: Array<{
    role: string;
    level: number;
  }>;
  eligibility?: {
    minTenureMonths?: number;
    positionsAllowed?: string[];
    contractTypesAllowed?: string[];
    excludeEmployees?: string[];
  };
  
  // Document Rules
  requiresDocumentAboveDays?: number;
  
  // Dates
  effectiveDate?: string;
  expiryDate?: string;
}

// ==================== API Functions ====================

/**
 * Get all leave policies
 */
export async function getPolicies(): Promise<LeavePolicy[]> {
  const { data } = await leavesApiClient.get<LeavePolicy[]>(LEAVE_POLICIES_BASE);
  return data;
}

/**
 * Get policy by ID
 */
export async function getPolicyById(id: string): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.get<LeavePolicy>(`${LEAVE_POLICIES_BASE}/${id}`);
  return data;
}

/**
 * Get policy by leave type ID
 */
export async function getPolicyByLeaveType(leaveTypeId: string): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.get<LeavePolicy>(
    `${LEAVE_POLICIES_BASE}/leave-type/${leaveTypeId}`
  );
  return data;
}

/**
 * Create new leave policy
 */
export async function createLeavePolicy(
  policyData: CreateLeavePolicyInput
): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.post<LeavePolicy>(
    LEAVE_POLICIES_BASE,
    policyData
  );
  return data;
}

/**
 * Update existing leave policy
 */
export async function updateLeavePolicy(
  id: string,
  policyData: UpdateLeavePolicyInput
): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.patch<LeavePolicy>(
    `${LEAVE_POLICIES_BASE}/${id}`,
    policyData
  );
  return data;
}

/**
 * Delete leave policy
 */
export async function deleteLeavePolicy(id: string): Promise<void> {
  await leavesApiClient.delete(`${LEAVE_POLICIES_BASE}/${id}`);
}

/**
 * Update policy eligibility rules
 */
export async function updatePolicyEligibility(
  id: string,
  eligibility: {
    minTenureMonths?: number;
    positionsAllowed?: string[];
    contractTypesAllowed?: string[];
    excludeEmployees?: string[];
  }
): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.patch<LeavePolicy>(
    `${LEAVE_POLICIES_BASE}/${id}`,
    { eligibility }
  );
  return data;
}
