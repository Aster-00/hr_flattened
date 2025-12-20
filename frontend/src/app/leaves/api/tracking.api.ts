// Tracking API functions
// src/app/leaves/api/tracking.api.ts
import { leavesApiClient } from './leaves.client';
import { LEAVE_TRACKING_BASE } from './leaves.endpoints';
import {
  MyBalancesResponse,
  MyHistoryResponse,
  TeamBalancesResponse,
  FlagIrregularResponse,
  AccrualJobResponse,
  CarryForwardJobResponse,
  MyBalancesQuery,
  MyHistoryQuery,
  TeamBalancesQuery,
  TeamHistoryQuery,
  FlagIrregularInput,
} from '@/app/leaves/types';

function buildQuery<T extends Record<string, unknown | undefined>>(params: T): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// GET /leaves/tracking/me/balances
export async function getMyBalances(
  query: MyBalancesQuery = {},
): Promise<MyBalancesResponse> {
  const qs = buildQuery(query as Record<string, unknown>);
  const { data } = await leavesApiClient.get<MyBalancesResponse>(
    `${LEAVE_TRACKING_BASE}/me/balances${qs}`,
  );
  return data;
}

// GET /leaves/tracking/me/history
export async function getMyHistory(
  query: MyHistoryQuery = {},
): Promise<MyHistoryResponse> {
  const qs = buildQuery(query as Record<string, unknown>);
  const { data } = await leavesApiClient.get<MyHistoryResponse>(
    `${LEAVE_TRACKING_BASE}/me/history${qs}`,
  );
  return data;
}

// GET /leaves/tracking/team/balances
export async function getTeamBalances(
  query: TeamBalancesQuery = {},
): Promise<TeamBalancesResponse> {
  const qs = buildQuery(query as Record<string, unknown>);
  const { data } = await leavesApiClient.get<TeamBalancesResponse>(
    `${LEAVE_TRACKING_BASE}/team/balances${qs}`,
  );
  return data;
}

// GET /leaves/tracking/team/history
export async function getTeamHistory(
  query: TeamHistoryQuery = {},
): Promise<MyHistoryResponse> {
  const qs = buildQuery(query as Record<string, unknown>);
  const { data } = await leavesApiClient.get<MyHistoryResponse>(
    `${LEAVE_TRACKING_BASE}/team/history${qs}`,
  );
  return data;
}

// POST /leaves/tracking/flag-irregular
export async function flagIrregularPattern(
  payload: FlagIrregularInput,
): Promise<FlagIrregularResponse> {
  const { data } = await leavesApiClient.post<FlagIrregularResponse>(
    `${LEAVE_TRACKING_BASE}/flag-irregular`,
    payload,
  );
  return data;
}

// POST /leaves/tracking/run-accrual
export async function runAccrualJob(): Promise<AccrualJobResponse> {
  const { data } = await leavesApiClient.post<AccrualJobResponse>(
    `${LEAVE_TRACKING_BASE}/run-accrual`,
  );
  return data;
}

// POST /leaves/tracking/run-carry-forward
export async function runCarryForwardJob(): Promise<CarryForwardJobResponse> {
  const { data } = await leavesApiClient.post<CarryForwardJobResponse>(
    `${LEAVE_TRACKING_BASE}/run-carry-forward`,
  );
  return data;
}
