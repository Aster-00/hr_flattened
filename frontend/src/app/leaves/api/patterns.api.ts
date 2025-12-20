// src/app/leaves/api/policies.api.ts

import { leavesApiClient } from './leaves.client';
import { LEAVE_POLICIES_BASE } from './leaves.endpoints';
import type { LeavePolicy, RoundingRule, AccrualMethod } from '@/app/leaves/types';

// ==================== DTOs ====================

/**
 * ✅ FIXED: Updated to match backend schema
 */
export interface CreateLeavePolicyInput {
  leaveTypeId: string;
  
  // Accrual Configuration
  accrualMethod: AccrualMethod;  // 'yearly' | 'monthly'
  yearlyRate?: number;           // ✅ ADDED
  monthlyRate?: number;          // ✅ ADDED
  
  // Carry Forward Configuration
  carryForwardAllowed: boolean;  // ✅ ADDED
  maxCarryForward?: number;      // ✅ ADDED
  carryForwardExpiryMonths?: number;
  
  // Rounding & Limits
  roundingRule: RoundingRule;    // ✅ ADDED
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
 * ✅ FIXED: Update DTO matches backend
 */
export interface UpdateLeavePolicyInput {
  // Accrual Configuration
  accrualMethod?: AccrualMethod;
  yearlyRate?: number;           // ✅ ADDED
  monthlyRate?: number;          // ✅ ADDED
  
  // Carry Forward Configuration
  carryForwardAllowed?: boolean; // ✅ ADDED
  maxCarryForward?: number;      // ✅ ADDED
  carryForwardExpiryMonths?: number;
  
  // Rounding & Limits
  roundingRule?: RoundingRule;   // ✅ ADDED
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

export async function getPolicies(): Promise<LeavePolicy[]> {
  const { data } = await leavesApiClient.get<LeavePolicy[]>(LEAVE_POLICIES_BASE);
  return data;
}

export async function getPolicyById(id: string): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.get<LeavePolicy>(`${LEAVE_POLICIES_BASE}/${id}`);
  return data;
}

export async function getPolicyByLeaveType(leaveTypeId: string): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.get<LeavePolicy>(`${LEAVE_POLICIES_BASE}/leave-type/${leaveTypeId}`);
  return data;
}

export async function createLeavePolicy(policyData: CreateLeavePolicyInput): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.post<LeavePolicy>(LEAVE_POLICIES_BASE, policyData);
  return data;
}

export async function updateLeavePolicy(
  id: string,
  policyData: UpdateLeavePolicyInput
): Promise<LeavePolicy> {
  const { data } = await leavesApiClient.patch<LeavePolicy>(`${LEAVE_POLICIES_BASE}/${id}`, policyData);
  return data;
}

export async function deleteLeavePolicy(id: string): Promise<void> {
  await leavesApiClient.delete(`${LEAVE_POLICIES_BASE}/${id}`);
}
