'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  fullScreen = false 
}) => {
  const sizeStyles = {
    sm: '1.5rem',
    md: '2.5rem',
    lg: '4rem'
  };

  const spinnerSize = sizeStyles[size];

  const spinner = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '1rem'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        width: spinnerSize,
        height: spinnerSize,
        border: '3px solid var(--border-light)',
        borderTopColor: 'var(--primary-600)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      
      {message && (
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)',
          margin: 0 
        }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};
