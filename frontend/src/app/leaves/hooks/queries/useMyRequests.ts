// useMyRequests query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { leavesApiClient, LEAVE_REQUESTS_BASE } from '@/app/leaves/api';
import { LeaveRequest } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'my-requests'];

async function fetchMyRequests(): Promise<LeaveRequest[]> {
  const { data } = await leavesApiClient.get<LeaveRequest[]>(`${LEAVE_REQUESTS_BASE}/me`);
  return data;
}

export function useMyRequests() {
  const result = useQuery<LeaveRequest[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchMyRequests,
  });

  return {
    requests: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
