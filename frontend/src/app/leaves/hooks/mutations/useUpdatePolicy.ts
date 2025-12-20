'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesExtendedApi, UpdatePolicyDto } from '../../api/policies-extended.api';

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePolicyDto }) => 
      policiesExtendedApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'policies'] });
    }
  });
};
