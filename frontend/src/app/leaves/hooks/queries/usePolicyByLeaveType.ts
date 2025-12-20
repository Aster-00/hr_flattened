'use client';
import { useQuery } from '@tanstack/react-query';
import { policiesExtendedApi } from '../../api/policies-extended.api';

export const usePolicyByLeaveType = (leaveTypeId: string) => {
  return useQuery({
    queryKey: ['leaves', 'policy-by-type', leaveTypeId],
    queryFn: () => policiesExtendedApi.getByLeaveType(leaveTypeId),
    enabled: !!leaveTypeId,
    staleTime: 1000 * 60 * 10
  });
};
