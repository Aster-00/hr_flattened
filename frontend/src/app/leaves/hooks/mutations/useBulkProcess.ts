// useBulkProcess mutation hook'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkProcessRequests } from '@/app/leaves/api';
import { BulkProcessInput } from '@/app/leaves/types';

export function useBulkProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkProcessInput) => bulkProcessRequests(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', 'team-balances'] });
    },
  });
}