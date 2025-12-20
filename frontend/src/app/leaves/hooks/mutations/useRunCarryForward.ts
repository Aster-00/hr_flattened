import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runCarryForwardJob } from '../../api/tracking.api';

export const useRunCarryForward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runCarryForwardJob(),
    onSuccess: () => {
      // Invalidate balances after carry-forward runs
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['team-balances'] });
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
    },
    onError: (error: any) => {
      console.error('Carry-forward job failed:', error);
    },
  });
};
