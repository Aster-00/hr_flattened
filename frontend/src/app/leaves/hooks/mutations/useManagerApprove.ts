// useManagerApprove mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { managerApproveRequest } from '@/app/leaves/api';
import { ManagerApprovalInput, LeaveRequest } from '@/app/leaves/types';

type ApproveVariables = {
  id: string;
  input: ManagerApprovalInput;
};

export function useManagerApprove() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, ApproveVariables>({
    mutationFn: ({ id, input }) => managerApproveRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-balances'] });
    },
  });
}
