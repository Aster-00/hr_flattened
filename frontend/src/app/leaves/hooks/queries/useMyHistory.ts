// useMyHistory query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyHistory } from '@/app/leaves/api';
import { MyHistoryResponse, MyHistoryQuery } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'my-history'];

export function useMyHistory(query: MyHistoryQuery = {}) {
  const result = useQuery<MyHistoryResponse>({
    queryKey: [...QUERY_KEY, query],
    queryFn: () => getMyHistory(query),
  });

  return {
    history: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
