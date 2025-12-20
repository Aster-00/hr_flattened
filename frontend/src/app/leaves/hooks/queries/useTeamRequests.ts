// useTeamRequests query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { leavesApiClient, LEAVE_REQUESTS_BASE } from '@/app/leaves/api';
import { LeaveRequest } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'team-requests'];

async function fetchTeamRequests(): Promise<LeaveRequest[]> {
  const { data } = await leavesApiClient.get<LeaveRequest[]>(`${LEAVE_REQUESTS_BASE}/team`);
  return data;
}

export function useTeamRequests() {
  const result = useQuery<LeaveRequest[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchTeamRequests,
  });

  return {
    requests: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
