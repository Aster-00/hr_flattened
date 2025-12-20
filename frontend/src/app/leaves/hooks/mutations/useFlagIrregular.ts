import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flagIrregularPattern } from '../../api/tracking.api';
import type { FlagIrregularInput } from '../../types';

export const useFlagIrregular = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FlagIrregularInput) =>
      flagIrregularPattern(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-requests'] });
    },
    onError: (error: any) => {
      console.error('Flag irregular failed:', error);
    },
  });
};
