// Leave Types API functions
import { leavesApiClient } from './leaves.client';
import { LEAVE_TYPES_BASE } from './leaves.endpoints';
import { LeaveType, CreateLeaveTypeInput, UpdateLeaveTypeInput } from '@/app/leaves/types';

export async function createLeaveType(payload: CreateLeaveTypeInput): Promise<LeaveType> {
  const { data } = await leavesApiClient.post<LeaveType>(LEAVE_TYPES_BASE, payload);
  return data;
}

export async function getAllLeaveTypes(): Promise<LeaveType[]> {
  const { data } = await leavesApiClient.get<LeaveType[]>(LEAVE_TYPES_BASE);
  return data;
}

export async function getLeaveType(id: string): Promise<LeaveType> {
  const { data } = await leavesApiClient.get<LeaveType>(`${LEAVE_TYPES_BASE}/${id}`);
  return data;
}

export async function updateLeaveType(id: string, payload: UpdateLeaveTypeInput): Promise<LeaveType> {
  const { data } = await leavesApiClient.patch<LeaveType>(`${LEAVE_TYPES_BASE}/${id}`, payload);
  return data;
}

export async function deleteLeaveType(id: string): Promise<void> {
  await leavesApiClient.delete(`${LEAVE_TYPES_BASE}/${id}`);
}
