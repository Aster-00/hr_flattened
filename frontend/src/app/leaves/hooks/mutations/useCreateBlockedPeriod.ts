// useCreateBlockedPeriod mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBlockedPeriod, CreateBlockedPeriodInput, BlockedPeriod } from '../../api/blocked-periods.api';

export function useCreateBlockedPeriod() {
  const queryClient = useQueryClient();

  return useMutation<BlockedPeriod, Error, CreateBlockedPeriodInput>({
    mutationFn: createBlockedPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'blocked-periods'] });
    },
  });
}
