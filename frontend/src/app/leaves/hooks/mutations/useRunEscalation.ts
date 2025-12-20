import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runPendingEscalationJob } from '../../api/escalation.api';

export const useRunEscalation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runPendingEscalationJob(),
    onSuccess: () => {
      // Invalidate requests after escalation runs
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-requests'] });
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
    },
    onError: (error: any) => {
      console.error('Escalation job failed:', error);
    },
  });
};
