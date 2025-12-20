// useTeamBalances query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTeamBalances } from '@/app/leaves/api';
import {
  TeamBalancesResponse,
  TeamBalancesQuery,
} from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'team-balances'];

export function useTeamBalances(query: TeamBalancesQuery = {}) {
  const result = useQuery<TeamBalancesResponse>({
    queryKey: [...QUERY_KEY, query],
    queryFn: () => getTeamBalances(query),
  });

  return {
    teamBalances: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
