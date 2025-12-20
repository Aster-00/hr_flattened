'use client';

import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty State Component
 * Displays a message when there's no data to show
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`card ${className}`}
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: '1rem',
            color: 'var(--text-tertiary)',
            fontSize: '3rem',
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '24rem',
            margin: '0 auto 1.5rem',
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
