// useTeamHistory query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamHistory } from '@/app/leaves/api';
import {
  MyHistoryResponse,
  TeamHistoryQuery,
} from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'team-history'];

export function useTeamHistory(query: TeamHistoryQuery = {}) {
  const result = useQuery<MyHistoryResponse>({
    queryKey: [...QUERY_KEY, query],
    queryFn: () => getTeamHistory(query),
  });

  return {
    history: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
