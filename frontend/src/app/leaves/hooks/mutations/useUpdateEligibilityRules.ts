// useUpdateEligibilityRules mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApiClient } from '../../api/leaves.client';
import { LEAVE_TYPES_BASE } from '../../api/leaves.endpoints';

export interface UpdateEligibilityRulesInput {
  leaveTypeId: string;
  minTenureMonths: number;
  minServiceDays: number;
  probationRestriction: boolean;
  allowedEmployeeTypes: string[];
  allowedGrades: string[];
  allowedLocations: string[];
}

async function updateEligibilityRules(input: UpdateEligibilityRulesInput): Promise<any> {
  const { leaveTypeId, ...payload } = input;
  const { data } = await leavesApiClient.post(
    `${LEAVE_TYPES_BASE}/${leaveTypeId}/eligibility`,
    payload
  );
  return data;
}

export function useUpdateEligibilityRules() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateEligibilityRulesInput>({
    mutationFn: updateEligibilityRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'leave-types'] });
    },
  });
}
