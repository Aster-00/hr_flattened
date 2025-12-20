// useRoles query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRoles, Role } from '../../api/roles.api';

const QUERY_KEY = ['roles'];

export function useRoles() {
  const result = useQuery<Role[]>({
    queryKey: QUERY_KEY,
    queryFn: getRoles,
  });

  return {
    roles: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
