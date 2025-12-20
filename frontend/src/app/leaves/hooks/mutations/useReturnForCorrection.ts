// useReturnForCorrection mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { returnRequestForCorrection } from '@/app/leaves/api';
import { ReturnForCorrectionInput, LeaveRequest } from '@/app/leaves/types';

type ReturnForCorrectionVariables = {
  id: string;
  input: ReturnForCorrectionInput;
};

export function useReturnForCorrection() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, ReturnForCorrectionVariables>({
    mutationFn: ({ id, input }) => returnRequestForCorrection(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-requests'] });
    },
  });
}
