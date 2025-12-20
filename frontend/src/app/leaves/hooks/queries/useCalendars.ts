// useCalendars query hook
'use client';

import { useQuery } from '@tanstack/react-query';
import { getCalendars } from '@/app/leaves/api';
import type { Calendar } from '@/app/leaves/types';

const QUERY_KEY = ['leaves', 'calendars'];

export function useCalendars() {
  const result = useQuery<Calendar[]>({
    queryKey: QUERY_KEY,
    queryFn: () => getCalendars(),
  });

  return {
    calendars: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
