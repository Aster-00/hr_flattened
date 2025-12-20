import React from 'react';

interface OverdueBadgeProps {
  createdAt: string;
  className?: string;
}

export const OverdueBadge: React.FC<OverdueBadgeProps> = ({ createdAt, className = '' }) => {
  const getAgeInfo = () => {
    const created = new Date(createdAt);
    const now = new Date();
    const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    return {
      hours: Math.floor(hours),
      display: hours < 48 ? `${Math.floor(hours)}h` : `${Math.floor(hours / 24)}d`
    };
  };

  const { hours, display } = getAgeInfo();

  if (hours <= 48) return null;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        backgroundColor: '#FEE2E2',
        border: '1px solid #FCA5A5',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#991B1B'
      }}
    >
      <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Overdue ({display})</span>
    </div>
  );
};
