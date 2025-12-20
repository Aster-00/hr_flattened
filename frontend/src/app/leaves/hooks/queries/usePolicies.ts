// usePolicies query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getPolicies } from '@/app/leaves/api';
import { LeavePolicy } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'policies'];

export function usePolicies() {
  const result = useQuery<LeavePolicy[]>({
    queryKey: QUERY_KEY,
    queryFn: () => getPolicies(),
  });

  return {
    policies: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
