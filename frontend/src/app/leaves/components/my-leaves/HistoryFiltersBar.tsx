'use client';

import React from 'react';
import { LeaveStatus, LeaveType } from '../../types';
import { formatStatus } from '../../utils/format';

interface HistoryFiltersBarProps {
  filters: {
    startDate?: string;
    endDate?: string;
    leaveTypeId?: string;
    status?: LeaveStatus;
  };
  onFiltersChange: (filters: {
    startDate?: string;
    endDate?: string;
    leaveTypeId?: string;
    status?: LeaveStatus;
  }) => void;
  leaveTypes: LeaveType[];
  onClearFilters: () => void;
  className?: string;
}

/**
 * History Filters Bar Component
 * Provides filtering options for leave history
 */
export default function HistoryFiltersBar({
  filters,
  onFiltersChange,
  leaveTypes,
  onClearFilters,
  className = '',
}: HistoryFiltersBarProps) {
  const hasActiveFilters = !!(
    filters.startDate ||
    filters.endDate ||
    filters.leaveTypeId ||
    filters.status
  );

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const statusOptions: LeaveStatus[] = [
    LeaveStatus.PENDING,
    LeaveStatus.APPROVED,
    LeaveStatus.REJECTED,
    LeaveStatus.CANCELLED,
    LeaveStatus.RETURNED,
    LeaveStatus.FINALIZED,
  ];

  return (
    <div
      className={`card ${className}`}
      style={{
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          Filter History
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              fontSize: '0.875rem',
              color: 'var(--leaves)',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Start Date */}
        <div>
          <label
            htmlFor="startDate"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border-medium)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="endDate"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border-medium)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Leave Type */}
        <div>
          <label
            htmlFor="leaveType"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            Leave Type
          </label>
          <select
            id="leaveType"
            value={filters.leaveTypeId || ''}
            onChange={(e) => handleFilterChange('leaveTypeId', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border-medium)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">All Types</option>
            {leaveTypes?.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value as LeaveStatus)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid var(--border-medium)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
