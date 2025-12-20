'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveTypesExtendedApi, CreateLeaveTypeDto } from '../../api/leave-types-extended.api';

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveTypeDto) => leaveTypesExtendedApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'types'] });
    }
  });
};
