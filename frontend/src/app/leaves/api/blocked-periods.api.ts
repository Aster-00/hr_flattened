// Blocked Periods API functions
import { leavesApiClient } from './leaves.client';
import { LEAVE_CALENDARS_BASE } from './leaves.endpoints';

export interface BlockedPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlockedPeriodInput {
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// GET /leaves/calendars/blocked-periods
export async function getBlockedPeriods(): Promise<BlockedPeriod[]> {
  const { data } = await leavesApiClient.get<BlockedPeriod[]>(
    `${LEAVE_CALENDARS_BASE}/blocked-periods`
  );
  return data;
}

// POST /leaves/calendars/blocked-periods
export async function createBlockedPeriod(
  payload: CreateBlockedPeriodInput
): Promise<BlockedPeriod> {
  const { data } = await leavesApiClient.post<BlockedPeriod>(
    `${LEAVE_CALENDARS_BASE}/blocked-periods`,
    payload
  );
  return data;
}

// DELETE /leaves/calendars/blocked-periods/:id
export async function deleteBlockedPeriod(id: string): Promise<void> {
  await leavesApiClient.delete(`${LEAVE_CALENDARS_BASE}/blocked-periods/${id}`);
}
