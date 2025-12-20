'use client';

import React from 'react';
import { LeaveStatus } from '../../types';

interface LeaveStatusBadgeProps {
  status: LeaveStatus | string | undefined | null;
  className?: string;
}

/**
 * Leave Status Badge Component
 * Displays a colored badge indicating the status of a leave request
 */
export default function LeaveStatusBadge({
  status,
  className = '',
}: LeaveStatusBadgeProps) {
  // Handle null/undefined status
  if (!status) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-medium)',
          whiteSpace: 'nowrap',
        }}
      >
        Unknown
      </span>
    );
  }

  const getStatusConfig = (status: LeaveStatus | string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = String(status).toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return {
          label: 'Pending',
          bgColor: 'var(--warning-light)',
          textColor: 'var(--warning-dark)',
          borderColor: 'var(--warning)',
        };
      case 'approved':
        return {
          label: 'Approved',
          bgColor: 'var(--success-light)',
          textColor: 'var(--success-dark)',
          borderColor: 'var(--success)',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          bgColor: 'var(--error-light)',
          textColor: 'var(--error-dark)',
          borderColor: 'var(--error)',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bgColor: 'var(--bg-tertiary)',
          textColor: 'var(--text-tertiary)',
          borderColor: 'var(--border-medium)',
        };
      case 'returned':
        return {
          label: 'Returned',
          bgColor: 'var(--info-light)',
          textColor: 'var(--info-dark)',
          borderColor: 'var(--info)',
        };
      case 'finalized':
        return {
          label: 'Finalized',
          bgColor: 'var(--leaves-light)',
          textColor: 'var(--leaves-dark)',
          borderColor: 'var(--leaves)',
        };
      default:
        // Capitalize first letter for display
        const displayLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        return {
          label: displayLabel,
          bgColor: 'var(--bg-tertiary)',
          textColor: 'var(--text-secondary)',
          borderColor: 'var(--border-medium)',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}
