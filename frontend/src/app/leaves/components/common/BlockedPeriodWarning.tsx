import React from 'react';
import { formatDate } from '../../utils/dates';

interface BlockedPeriod {
  from: string;
  to: string;
  reason: string;
}

interface BlockedPeriodWarningProps {
  blockedPeriods: BlockedPeriod[];
  isChecking?: boolean;
}

export default function BlockedPeriodWarning({ blockedPeriods, isChecking }: BlockedPeriodWarningProps) {
  if (isChecking) {
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
          Checking for blocked periods...
        </p>
      </div>
    );
  }

  if (!blockedPeriods || blockedPeriods.length === 0) {
    return null;
  }

  return (
    <div style={{
      padding: '1rem',
      borderRadius: 'var(--radius-lg)',
      background: '#FEE2E2',
      border: '1px solid #DC2626',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <svg 
          style={{ width: '1.25rem', height: '1.25rem', color: '#DC2626', flexShrink: 0 }} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#991B1B', 
            fontWeight: '600', 
            marginBottom: '0.25rem' 
          }}>
            Blocked Period Detected
          </p>
          <p style={{ fontSize: '0.875rem', color: '#991B1B', marginBottom: '0.75rem' }}>
            The selected dates fall within {blockedPeriods.length === 1 ? 'a blocked period' : `${blockedPeriods.length} blocked periods`}. 
            Leave requests during these periods are typically not approved.
          </p>
          
          {/* List of blocked periods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {blockedPeriods.map((period, index) => (
              <div 
                key={index}
                style={{
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #DC2626',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg 
                      style={{ width: '1rem', height: '1rem', color: '#DC2626', flexShrink: 0 }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" 
                      />
                    </svg>
                    <span style={{ fontWeight: '600', color: '#991B1B' }}>
                      {formatDate(period.from)} - {formatDate(period.to)}
                    </span>
                  </div>
                  <p style={{ color: '#991B1B', marginLeft: '1.5rem' }}>
                    {period.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.7rem', color: '#991B1B', marginTop: '0.75rem', fontStyle: 'italic' }}>
            ⚠️ We strongly recommend choosing different dates. Submitting this request may result in automatic rejection.
          </p>
        </div>
      </div>
    </div>
  );
}
