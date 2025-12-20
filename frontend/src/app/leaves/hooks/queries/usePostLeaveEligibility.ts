'use client';
import { useQuery } from '@tanstack/react-query';
import { leavesApiClient } from '../../api/leaves.client';

export const usePostLeaveEligibility = (fromDate: string) => {
  return useQuery({
    queryKey: ['leaves', 'post-leave-eligible', fromDate],
    queryFn: async () => {
      const response = await leavesApiClient.get(`/leaves/requests/post-leave-eligible?fromDate=${fromDate}`);
      return response.data as {
        eligible: boolean;
        daysRemaining: number;
        maxDays: number;
        daysSinceLeaveStart: number;
      };
    },
    enabled: !!fromDate,
    staleTime: 0
  });
};
