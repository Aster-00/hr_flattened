// useUpdateLeaveRequest mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLeaveRequest } from '@/app/leaves/api';
import { UpdateLeaveRequestInput, LeaveRequest } from '@/app/leaves/types';

type UpdateRequestVariables = {
  id: string;
  input: UpdateLeaveRequestInput;
};

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, UpdateRequestVariables>({
    mutationFn: ({ id, input }) => updateLeaveRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
    },
  });
}
