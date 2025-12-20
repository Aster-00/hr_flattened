'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOverrideRequest } from '@/app/leaves/api';
import type { HROverrideInput, LeaveRequest } from '@/app/leaves/types';

type OverrideVariables = {
  id: string;
  input: HROverrideInput;
};

export function useHrOverride() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, OverrideVariables>({
    mutationFn: ({ id, input }) => hrOverrideRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-balances'] });
    },
  });
}
