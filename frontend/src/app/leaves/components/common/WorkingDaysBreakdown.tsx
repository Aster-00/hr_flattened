import React, { useState } from 'react';
import { formatDate } from '../../utils/dates';

interface ExcludedDay {
  date: string;
  reason: string;
  type: 'weekend' | 'holiday' | 'blocked';
}

interface WorkingDaysBreakdownProps {
  totalCalendarDays: number;
  workingDays: number;
  excludedDays: ExcludedDay[];
  isCalculating?: boolean;
}

export default function WorkingDaysBreakdown({
  totalCalendarDays,
  workingDays,
  excludedDays,
  isCalculating,
}: WorkingDaysBreakdownProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (isCalculating) {
    return (
      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gray-50)',
        border: '1px solid var(--gray-300)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div className="leaves-spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Calculating working days...
        </p>
      </div>
    );
  }

  if (totalCalendarDays === 0 || workingDays === 0) {
    return null;
  }

  const hasExcludedDays = excludedDays.length > 0;

  return (
    <div style={{
      padding: '1rem',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--leaves-50)',
      border: '1px solid var(--leaves-200)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: '500', marginBottom: '0.25rem' }}>
            Duration: <strong style={{ color: 'var(--leaves-700)' }}>{totalCalendarDays} {totalCalendarDays === 1 ? 'day' : 'days'}</strong> selected
          </p>
          {hasExcludedDays ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--leaves-600)', fontWeight: '600' }}>
              Net Working Days: <strong style={{ color: 'var(--leaves-700)' }}>{workingDays}</strong> {workingDays === 1 ? 'day' : 'days'}
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '400', marginLeft: '0.5rem' }}>
                ({excludedDays.length} {excludedDays.length === 1 ? 'day' : 'days'} excluded)
              </span>
            </p>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
              All selected days are working days
            </p>
          )}
        </div>
        
        {hasExcludedDays && (
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--leaves-300)',
              background: 'white',
              color: 'var(--leaves-700)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--leaves-100)';
              e.currentTarget.style.borderColor = 'var(--leaves-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'var(--leaves-300)';
            }}
          >
            {showBreakdown ? 'Hide' : 'Show'} Details
            <svg 
              style={{ 
                width: '1rem', 
                height: '1rem',
                transform: showBreakdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Breakdown Details */}
      {showBreakdown && hasExcludedDays && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--leaves-200)'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            Excluded Days:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {excludedDays.map((day, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)',
                  fontSize: '0.75rem'
                }}
              >
                <span style={{ color: 'var(--gray-900)', fontWeight: '500' }}>
                  {formatDate(day.date)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 
                      day.type === 'weekend' ? '#F3F4F6' :
                      day.type === 'holiday' ? '#DBEAFE' :
                      '#FEE2E2',
                    color:
                      day.type === 'weekend' ? '#6B7280' :
                      day.type === 'holiday' ? '#1E40AF' :
                      '#991B1B',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {day.type}
                  </span>
                  <span style={{ color: 'var(--gray-600)' }}>
                    {day.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
