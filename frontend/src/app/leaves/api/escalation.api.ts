// Escalation API functions
// src/app/leaves/api/escalation.api.ts
import { leavesApiClient } from './leaves.client';

const ESCALATION_BASE = '/leaves/escalation';

// POST /leaves/escalation/run-pending-escalation
export async function runPendingEscalationJob(): Promise<{
  jobId: string;
  executedAt: string;
  requestsEscalated: number;
}> {
  const { data } = await leavesApiClient.post<{
    jobId: string;
    executedAt: string;
    requestsEscalated: number;
  }>(`${ESCALATION_BASE}/run-pending-escalation`);
  return data;
}
