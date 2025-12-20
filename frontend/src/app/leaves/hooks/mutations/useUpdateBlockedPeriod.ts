'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blockedPeriodsExtendedApi, UpdateBlockedPeriodDto } from '../../api/blocked-periods-extended.api';

export const useUpdateBlockedPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlockedPeriodDto }) => 
      blockedPeriodsExtendedApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'blocked-periods'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'calendars'] });
    }
  });
};
