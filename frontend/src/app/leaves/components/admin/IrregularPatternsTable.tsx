'use client';

import React, { useState } from 'react';
import { useIrregularPatterns } from '../../hooks/queries/useIrregularPatterns';

export const IrregularPatternsTable: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data, isLoading, error } = useIrregularPatterns(filters);

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid var(--border-light)'
    }}>
      {/* Header with Stats */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Irregular Leave Patterns
          </h3>
          {data && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-600)' }}>
                  {data.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                  {data.flagged}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Flagged</div>
              </div>
            </div>
          )}
        </div>

        {/* Date Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border-light)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border-light)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          Analyzing leave patterns...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: '#dc2626'
        }}>
          Error: {error.message}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Employee
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Total Requests
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Frequent Fridays
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Frequent Mondays
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Pre-Holiday
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Risk Score
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.employees?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No irregular patterns detected
                  </td>
                </tr>
              ) : (
                data?.employees?.map((emp: any) => (
                  <tr key={emp.employee._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {emp.employee.name}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)', textAlign: 'center' }}>
                      {emp.patterns.totalRequests}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: emp.patterns.frequentFridays > 3 ? '#fee2e2' : '#f3f4f6',
                        color: emp.patterns.frequentFridays > 3 ? '#dc2626' : 'var(--text-primary)'
                      }}>
                        {emp.patterns.frequentFridays}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: emp.patterns.frequentMondays > 3 ? '#fee2e2' : '#f3f4f6',
                        color: emp.patterns.frequentMondays > 3 ? '#dc2626' : 'var(--text-primary)'
                      }}>
                        {emp.patterns.frequentMondays}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                      {emp.patterns.preHolidayRequests}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: emp.score >= 70 ? '#fee2e2' : emp.score >= 40 ? '#fef3c7' : '#d1fae5',
                        color: emp.score >= 70 ? '#dc2626' : emp.score >= 40 ? '#d97706' : '#059669'
                      }}>
                        {emp.score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
