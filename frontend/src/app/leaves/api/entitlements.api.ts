// Entitlements API functions
// src/app/leaves/api/entitlements.api.ts
import { leavesApiClient } from './leaves.client';
import { LEAVE_ENTITLEMENTS_BASE } from './leaves.endpoints';
import {
  ObjectId,
} from '@/app/leaves/types';

// These input types match your backend DTOs conceptually.
// If you already defined more precise ones in leaves.inputs.ts,
// you can replace these with those existing types.

export interface CreateEntitlementInput {
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  year: number;
  totalEntitlement: number;
  carriedOver?: number;
}

export interface UpdateEntitlementInput {
  totalEntitlement?: number;
  used?: number;
  pending?: number;
  carriedOver?: number;
}

export interface PersonalizedEntitlementInput {
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  year: number;
  totalEntitlement: number;
  carriedOver?: number;
}

// The backend returns the LeaveEntitlement document shape;
// reuse the same shape as in your MyBalances types when needed.
export interface LeaveEntitlement {
  _id: ObjectId;
  employeeId: ObjectId;
  leaveTypeId: ObjectId;
  year: number;
  totalEntitlement: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  carriedExpiry?: string;
  lastAccrualDate?: string;
  createdAt: string;
  updatedAt: string;
}

// POST /leaves/entitlements
export async function createEntitlement(
  payload: CreateEntitlementInput,
): Promise<LeaveEntitlement> {
  const { data } = await leavesApiClient.post<LeaveEntitlement>(
    LEAVE_ENTITLEMENTS_BASE,
    payload,
  );
  return data;
}

// PATCH /leaves/entitlements/:id
export async function updateEntitlement(
  id: string,
  payload: UpdateEntitlementInput,
): Promise<LeaveEntitlement> {
  const { data } = await leavesApiClient.patch<LeaveEntitlement>(
    `${LEAVE_ENTITLEMENTS_BASE}/${id}`,
    payload,
  );
  return data;
}

// POST /leaves/entitlements/assign
export async function assignPersonalizedEntitlement(
  payload: PersonalizedEntitlementInput,
): Promise<LeaveEntitlement> {
  const { data } = await leavesApiClient.post<LeaveEntitlement>(
    `${LEAVE_ENTITLEMENTS_BASE}/assign`,
    payload,
  );
  return data;
}

// POST /leaves/entitlements/bulk-assign
export async function bulkAssignEntitlements(
  assignments: PersonalizedEntitlementInput[],
): Promise<{ success: boolean; count: number; results: LeaveEntitlement[] }> {
  const { data } = await leavesApiClient.post<{ success: boolean; count: number; results: LeaveEntitlement[] }>(
    `${LEAVE_ENTITLEMENTS_BASE}/bulk-assign`,
    { assignments },
  );
  return data;
}
