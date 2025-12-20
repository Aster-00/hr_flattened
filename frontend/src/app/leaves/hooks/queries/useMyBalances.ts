// useMyBalances query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyBalances } from '@/app/leaves/api';
import { MyBalancesResponse, MyBalancesQuery } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'my-balances'];

export function useMyBalances(query: MyBalancesQuery = {}) {
  const result = useQuery<MyBalancesResponse>({
    queryKey: [...QUERY_KEY, query],
    queryFn: () => getMyBalances(query),
  });

  return {
    balances: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
