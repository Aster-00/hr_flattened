'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesExtendedApi, CreatePolicyDto } from '../../api/policies-extended.api';

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePolicyDto) => policiesExtendedApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'policies'] });
    }
  });
};
