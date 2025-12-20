'use client';

import { LeaveType } from '../../types/leaves.types';
import { formatLeaveTypeCode } from '../../utils/format';

interface LeaveTypeChipProps {
  leaveType: LeaveType | { code: string; name?: string };
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'filled';
  className?: string;
}

/**
 * Leave Type Chip Component
 * Displays a leave type with consistent styling
 */
export default function LeaveTypeChip({
  leaveType,
  size = 'medium',
  variant = 'default',
  className = '',
}: LeaveTypeChipProps) {
  const displayName = leaveType.name || formatLeaveTypeCode(leaveType.code);

  const sizeStyles = {
    small: {
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
    },
    medium: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.8125rem',
    },
    large: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
    },
  };

  const variantStyles = {
    default: {
      backgroundColor: 'var(--leaves)',
      color: 'var(--text-inverse)',
      border: 'none',
    },
    outlined: {
      backgroundColor: 'transparent',
      color: 'var(--leaves)',
      border: '1px solid var(--leaves)',
    },
    filled: {
      backgroundColor: 'var(--info-light)',
      color: 'var(--info-dark)',
      border: 'none',
    },
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        borderRadius: '9999px',
        fontWeight: 500,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {displayName}
    </span>
  );
}
