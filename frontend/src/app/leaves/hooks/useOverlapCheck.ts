// useOverlapCheck hook for checking overlapping leave requests
'use client';

import { useState, useEffect, useRef } from 'react';
import { checkOverlappingRequests } from '@/app/leaves/api';

interface OverlapCheckResult {
  hasOverlap: boolean;
  overlappingRequests: Array<{
    _id: string;
    status: string;
    dates: { from: string; to: string };
    leaveType: { name: string };
  }>;
}

export function useOverlapCheck(
  startDate: string,
  endDate: string,
  excludeId?: string,
  debounceMs: number = 800
) {
  const [isChecking, setIsChecking] = useState(false);
  const [overlapData, setOverlapData] = useState<OverlapCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset state if dates are invalid
    if (!startDate || !endDate) {
      setOverlapData(null);
      setError(null);
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setOverlapData(null);
      setError(null);
      return;
    }

    // Set loading state immediately
    setIsChecking(true);
    setError(null);

    // Debounced API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await checkOverlappingRequests(startDate, endDate, excludeId);
        setOverlapData(result);
        setIsChecking(false);
      } catch (err: any) {
        // Fail silently for better UX - just log to console
        console.error('Overlap check failed:', err);
        setError(err.message);
        setIsChecking(false);
        setOverlapData(null);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startDate, endDate, excludeId, debounceMs]);

  return {
    isChecking,
    hasOverlap: overlapData?.hasOverlap || false,
    overlappingRequests: overlapData?.overlappingRequests || [],
    error,
  };
}
