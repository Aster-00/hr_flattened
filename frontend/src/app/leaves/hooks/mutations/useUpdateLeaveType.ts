'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveTypesExtendedApi, UpdateLeaveTypeDto } from '../../api/leave-types-extended.api';

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveTypeDto }) => 
      leaveTypesExtendedApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'types'] });
    }
  });
};
