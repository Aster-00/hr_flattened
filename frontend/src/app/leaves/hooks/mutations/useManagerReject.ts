// useManagerReject mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { managerRejectRequest } from '@/app/leaves/api';
import { ManagerRejectionInput, LeaveRequest } from '@/app/leaves/types';

type RejectVariables = {
  id: string;
  input: ManagerRejectionInput;
};

export function useManagerReject() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, RejectVariables>({
    mutationFn: ({ id, input }) => managerRejectRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
    },
  });
}
