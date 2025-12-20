// useBlockedPeriods query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getBlockedPeriods, BlockedPeriod } from '../../api/blocked-periods.api';

const QUERY_KEY = ['leaves', 'blocked-periods'];

export function useBlockedPeriods() {
  const result = useQuery<BlockedPeriod[]>({
    queryKey: QUERY_KEY,
    queryFn: getBlockedPeriods,
  });

  return {
    blockedPeriods: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
