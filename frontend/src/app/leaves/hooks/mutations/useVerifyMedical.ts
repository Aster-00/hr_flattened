import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyMedicalDocuments } from '../../api/requests.api';

export const useVerifyMedical = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      verifyMedicalDocuments(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-requests'] });
    },
    onError: (error: any) => {
      console.error('Medical verification failed:', error);
    },
  });
};
