'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveTypesExtendedApi } from '../../api/leave-types-extended.api';

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveTypesExtendedApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'types'] });
    }
  });
};
