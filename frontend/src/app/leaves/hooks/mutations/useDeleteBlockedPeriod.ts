// useDeleteBlockedPeriod mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBlockedPeriod } from '../../api/blocked-periods.api';

export function useDeleteBlockedPeriod() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteBlockedPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'blocked-periods'] });
    },
  });
}
