// useWorkingDays hook for calculating net working days
'use client';

import { useState, useEffect, useRef } from 'react';
import { calculateWorkingDays } from '@/app/leaves/api';

interface ExcludedDay {
  date: string;
  reason: string;
  type: 'weekend' | 'holiday' | 'blocked';
}

interface WorkingDaysResult {
  totalCalendarDays: number;
  workingDays: number;
  excludedDays: ExcludedDay[];
}

export function useWorkingDays(
  startDate: string,
  endDate: string,
  debounceMs: number = 600
) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [workingDaysData, setWorkingDaysData] = useState<WorkingDaysResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset state if dates are invalid
    if (!startDate || !endDate) {
      setWorkingDaysData(null);
      setError(null);
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setWorkingDaysData(null);
      setError(null);
      return;
    }

    // Set loading state immediately
    setIsCalculating(true);
    setError(null);

    // Debounced API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await calculateWorkingDays(startDate, endDate);
        
        // Transform API response to match WorkingDaysResult interface
        const transformedResult: WorkingDaysResult = {
          totalCalendarDays: result.totalDays,
          workingDays: result.workingDays,
          excludedDays: result.excludedDates.map((excluded: any) => ({
            date: excluded.date,
            reason: excluded.reason,
            type: excluded.type || 'holiday' // Provide default if not present
          }))
        };
        
        setWorkingDaysData(transformedResult);
        setIsCalculating(false);
      } catch (err: any) {
        console.error('Working days calculation failed:', err);
        setError(err.message);
        setIsCalculating(false);
        // Fallback: calculate simple calendar days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setWorkingDaysData({
          totalCalendarDays: diffDays,
          workingDays: diffDays,
          excludedDays: [],
        });
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startDate, endDate, debounceMs]);

  return {
    isCalculating,
    totalCalendarDays: workingDaysData?.totalCalendarDays || 0,
    workingDays: workingDaysData?.workingDays || 0,
    excludedDays: workingDaysData?.excludedDays || [],
    error,
  };
}
