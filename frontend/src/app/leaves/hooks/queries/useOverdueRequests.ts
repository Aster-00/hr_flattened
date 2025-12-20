'use client';
import { useQuery } from '@tanstack/react-query';
import { overdueApi } from '../../api/overdue.api';

export const useOverdueRequests = (departmentId?: string) => {
  return useQuery({
    queryKey: ['leaves', 'overdue-requests', departmentId],
    queryFn: () => overdueApi.getOverdueRequests(departmentId),
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 2
  });
};
