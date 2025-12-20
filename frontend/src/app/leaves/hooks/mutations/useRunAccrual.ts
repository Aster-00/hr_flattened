import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runAccrualJob } from '../../api/tracking.api';

export const useRunAccrual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runAccrualJob(),
    onSuccess: () => {
      // Invalidate balances after accrual runs
      queryClient.invalidateQueries({ queryKey: ['my-balances'] });
      queryClient.invalidateQueries({ queryKey: ['team-balances'] });
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
    },
    onError: (error: any) => {
      console.error('Accrual job failed:', error);
    },
  });
};
