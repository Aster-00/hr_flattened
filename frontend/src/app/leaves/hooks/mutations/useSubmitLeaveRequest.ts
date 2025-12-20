// useSubmitLeaveRequest mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitLeaveRequest } from '@/app/leaves/api';
import { CreateLeaveRequestInput, LeaveRequest } from '@/app/leaves/types';

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, CreateLeaveRequestInput>({
    mutationFn: (input) => submitLeaveRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
    },
  });
}
