// useIrregularPatterns query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { leavesApiClient } from '@/app/leaves/api/leaves.client';

// ==================== Types ====================

export interface IrregularPattern {
  _id: string;
  employeeId: string;
  employeeName?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  requestId: string;
  flaggedAt: string;
  flaggedBy: string;
  reason: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface IrregularPatternsFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  employeeId?: string;
  resolved?: boolean;
}

export interface IrregularPatternsResponse {
  total: number;
  flagged: number;
  employees?: any[];
}

// ==================== API Functions ====================

async function fetchIrregularPatterns(
  filters?: IrregularPatternsFilters
): Promise<IrregularPatternsResponse> {
  const { data } = await leavesApiClient.get<IrregularPatternsResponse>(
    '/leaves/requests/irregular-patterns',
    { params: filters }
  );
  return data;
}

// ==================== React Query Hook ====================

const QUERY_KEY = ['leaves', 'irregular-patterns'];

export function useIrregularPatterns(filters?: IrregularPatternsFilters) {
  const result = useQuery<IrregularPatternsResponse>({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => fetchIrregularPatterns(filters),
  });

  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
