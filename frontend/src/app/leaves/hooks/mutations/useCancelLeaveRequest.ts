// useCancelLeaveRequest mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelLeaveRequest } from '@/app/leaves/api';
import { LeaveRequest } from '@/app/leaves/types';

export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; request: LeaveRequest }, Error, string>({
    mutationFn: (id) => cancelLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
    },
  });
}
