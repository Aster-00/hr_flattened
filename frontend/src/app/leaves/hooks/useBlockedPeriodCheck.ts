// useBlockedPeriodCheck hook for checking blocked periods
'use client';

import { useState, useEffect, useRef } from 'react';
import { checkBlockedPeriods } from '@/app/leaves/api';

interface BlockedPeriod {
  from: string;
  to: string;
  reason?: string;
}

interface BlockedPeriodResult {
  hasBlockedPeriod: boolean;
  blockedPeriods: BlockedPeriod[];
}

export function useBlockedPeriodCheck(
  startDate: string,
  endDate: string,
  debounceMs: number = 600
) {
  const [isChecking, setIsChecking] = useState(false);
  const [blockedData, setBlockedData] = useState<BlockedPeriodResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset state if dates are invalid
    if (!startDate || !endDate) {
      setBlockedData(null);
      setError(null);
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setBlockedData(null);
      setError(null);
      return;
    }

    // Set loading state immediately
    setIsChecking(true);
    setError(null);

    // Debounced API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await checkBlockedPeriods(startDate, endDate);
        setBlockedData(result);
        setIsChecking(false);
      } catch (err: any) {
        // Fail silently for better UX - just log to console
        console.error('Blocked period check failed:', err);
        setError(err.message);
        setIsChecking(false);
        setBlockedData({ hasBlockedPeriod: false, blockedPeriods: [] });
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startDate, endDate, debounceMs]);

  return {
    isChecking,
    hasBlockedPeriod: blockedData?.hasBlockedPeriod || false,
    blockedPeriods: blockedData?.blockedPeriods || [],
    error,
  };
}
