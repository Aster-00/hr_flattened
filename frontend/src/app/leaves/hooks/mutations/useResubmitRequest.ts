// useResubmitRequest mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resubmitLeaveRequest } from '@/app/leaves/api';
import { LeaveRequest } from '@/app/leaves/types';

export function useResubmitRequest() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, string>({
    mutationFn: (id) => resubmitLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
    },
  });
}
