// src/app/leaves/api/requests.api.ts
import { leavesApiClient } from './leaves.client';
import { checkAuth } from '@/app/lib/auth'; // ✅ Correct path

import {
  LeaveRequest,
  IntegrationDetailsResponse,
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
  ManagerApprovalInput,
  ManagerRejectionInput,
  ReturnForCorrectionInput,
  HRFinalizeInput,
  HROverrideInput,
  BulkProcessInput,
} from '@/app/leaves/types';
import { LEAVE_REQUESTS_BASE } from './leaves.endpoints';

export async function submitLeaveRequest(
  payload: CreateLeaveRequestInput,
): Promise<LeaveRequest> {
  const { data } = await leavesApiClient.post<LeaveRequest>(
    LEAVE_REQUESTS_BASE,
    payload,
  );
  return data;
}

export async function updateLeaveRequest(
  id: string,
  payload: UpdateLeaveRequestInput,
): Promise<LeaveRequest> {
  const { data } = await leavesApiClient.patch<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}`,
    payload,
  );
  return data;
}

export async function cancelLeaveRequest(
  id: string,
): Promise<{ message: string; request: LeaveRequest }> {
  const { data } = await leavesApiClient.delete<{
    message: string;
    request: LeaveRequest;
  }>(`${LEAVE_REQUESTS_BASE}/${id}/cancel`);
  return data;
}

export async function managerApproveRequest(
  id: string,
  payload: ManagerApprovalInput,
): Promise<LeaveRequest> {
  const { data } = await leavesApiClient.post<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}/manager-approve`,
    payload,
  );
  return data;
}

export async function managerRejectRequest(
  id: string,
  payload: ManagerRejectionInput,
): Promise<LeaveRequest> {
  const { data } = await leavesApiClient.post<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}/manager-reject`,
    payload,
  );
  return data;
}

export async function returnRequestForCorrection(
  id: string,
  payload: ReturnForCorrectionInput,
): Promise<LeaveRequest> {
  const { data } = await leavesApiClient.post<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}/return-for-correction`,
    payload,
  );
  return data;
}

export async function resubmitLeaveRequest(id: string): Promise<LeaveRequest> {
  const { data } = await leavesApiClient.post<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}/resubmit`,
  );
  return data;
}

// ✅ FIXED: Get user ID and add to payload
export async function hrFinalizeRequest(
  id: string,
  payload: HRFinalizeInput,
): Promise<LeaveRequest> {
  // Get current user
  const user = await checkAuth();
  if (!user || !user.id) {
    throw new Error('User not authenticated or user ID not found');
  }

  // Add hrUserId to payload
  const requestPayload = {
    ...payload,
    hrUserId: user.id, // ✅ Add the user ID here
  };

  console.log('📤 HR Finalize Payload:', requestPayload); // Debug log

  const { data } = await leavesApiClient.post<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}/hr-finalize`,
    requestPayload,
  );
  return data;
}

// ✅ FIXED: Get user ID and add to payload
export async function hrOverrideRequest(
  id: string,
  payload: HROverrideInput,
): Promise<LeaveRequest> {
  // Get current user
  const user = await checkAuth();
  if (!user || !user.id) {
    throw new Error('User not authenticated or user ID not found');
  }

  // Add hrUserId to payload
  const requestPayload = {
    ...payload,
    hrUserId: user.id, // ✅ Add the user ID here
  };

  console.log('📤 HR Override Payload:', requestPayload); // Debug log

  const { data } = await leavesApiClient.post<LeaveRequest>(
    `${LEAVE_REQUESTS_BASE}/${id}/hr-override`,
    requestPayload,
  );
  return data;
}

export async function verifyMedicalDocuments(
  id: string,
): Promise<unknown> {
  const { data} = await leavesApiClient.get(
    `${LEAVE_REQUESTS_BASE}/${id}/verify-medical`,
  );
  return data;
}

export async function bulkProcessRequests(
  payload: BulkProcessInput,
): Promise<{
  processed: number;
  successful: number;
  failed: number;
  results: Array<{
    requestId: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}> {
  const { data } = await leavesApiClient.post(
    `${LEAVE_REQUESTS_BASE}/bulk-process`,
    payload,
  );
  return data;
}

export async function getIntegrationDetails(
  id: string,
): Promise<IntegrationDetailsResponse> {
  const { data } = await leavesApiClient.get<IntegrationDetailsResponse>(
    `${LEAVE_REQUESTS_BASE}/${id}/integration-details`,
  );
  return data;
}

export async function checkOverlappingRequests(
  from: string,
  to: string,
  excludeId?: string,
): Promise<{
  hasOverlap: boolean;
  overlappingRequests: Array<{
    _id: string;
    status: string;
    dates: { from: string; to: string };
    leaveType: { name: string };
  }>;
}> {
  const params: any = { from, to };
  if (excludeId) {
    params.excludeId = excludeId;
  }
  const { data } = await leavesApiClient.get(
    `${LEAVE_REQUESTS_BASE}/check-overlap`,
    { params },
  );
  return data;
}
