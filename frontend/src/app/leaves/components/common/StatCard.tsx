'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  color = 'primary',
  loading = false
}) => {
  const colorStyles = {
    primary: {
      bg: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
      text: 'white'
    },
    success: {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      text: 'white'
    },
    warning: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      text: 'white'
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      text: 'white'
    }
  };

  const style = colorStyles[color];

  if (loading) {
    return (
      <div style={{
        background: style.bg,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        color: style.text,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      background: style.bg,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      color: style.text,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(30%, -30%)'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        {icon && (
          <div style={{ marginBottom: '0.75rem', opacity: 0.9 }}>
            {icon}
          </div>
        )}

        {/* Title */}
        <div style={{ 
          fontSize: '0.875rem', 
          opacity: 0.9, 
          marginBottom: '0.5rem',
          fontWeight: '500'
        }}>
          {title}
        </div>

        {/* Value */}
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          marginBottom: subtitle || trend ? '0.5rem' : 0,
          lineHeight: 1
        }}>
          {value}
        </div>

        {/* Subtitle or Trend */}
        {subtitle && (
          <div style={{ 
            fontSize: '0.75rem', 
            opacity: 0.85,
            marginTop: '0.5rem'
          }}>
            {subtitle}
          </div>
        )}

        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            opacity: 0.9
          }}>
            {trend.isPositive ? (
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
