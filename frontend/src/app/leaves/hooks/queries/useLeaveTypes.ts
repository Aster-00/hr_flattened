// useLeaveTypes query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { leavesApiClient, LEAVE_TYPES_BASE } from '@/app/leaves/api';
import { LeaveType } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'types'];

async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const { data } = await leavesApiClient.get<LeaveType[]>(LEAVE_TYPES_BASE);
  return data;
}

export function useLeaveTypes() {
  const result = useQuery<LeaveType[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchLeaveTypes,
  });

  return {
    types: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
