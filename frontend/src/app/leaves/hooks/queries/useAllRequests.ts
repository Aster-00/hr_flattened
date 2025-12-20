// useAllRequests query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { leavesApiClient, LEAVE_REQUESTS_BASE } from '@/app/leaves/api';
import { LeaveRequest } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'all-requests'];

async function fetchAllRequests(): Promise<LeaveRequest[]> {
  const { data } = await leavesApiClient.get<LeaveRequest[]>(LEAVE_REQUESTS_BASE);
  return data;
}

export function useAllRequests() {
  const result = useQuery<LeaveRequest[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchAllRequests,
  });

  return {
    requests: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
