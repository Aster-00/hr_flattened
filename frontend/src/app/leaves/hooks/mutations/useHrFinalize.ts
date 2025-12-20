'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hrFinalizeRequest } from '@/app/leaves/api';
import type { HRFinalizeInput, LeaveRequest } from '@/app/leaves/types';

type FinalizeVariables = {
  id: string;
  input: HRFinalizeInput;
};

export function useHrFinalize() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, FinalizeVariables>({
    mutationFn: ({ id, input }) => hrFinalizeRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-balances'] });
    },
  });
}
