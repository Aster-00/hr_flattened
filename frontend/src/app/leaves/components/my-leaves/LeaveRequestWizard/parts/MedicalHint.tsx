'use client';

import React from 'react';

interface MedicalHintProps {
  leaveTypeName: string;
  requiresDocumentation: boolean;
  maxDays?: number;
  className?: string;
}

/**
 * Medical Hint Component
 * Displays helpful information about medical leave documentation requirements
 */
export default function MedicalHint({
  leaveTypeName,
  requiresDocumentation,
  maxDays,
  className = '',
}: MedicalHintProps) {
  if (!requiresDocumentation) {
    return null;
  }

  const isSickLeave = leaveTypeName.toLowerCase().includes('sick') ||
    leaveTypeName.toLowerCase().includes('medical');

  return (
    <div
      className={`alert alert-info ${className}`}
      style={{
        marginTop: '1rem',
        padding: '0.875rem 1rem',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          fontSize: '1.25rem',
          flexShrink: 0,
        }}
      >
        ℹ️
      </div>
      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: '0.25rem',
            color: 'var(--info-dark)',
          }}
        >
          Documentation Required
        </div>
        <div
          style={{
            color: 'var(--info-dark)',
            lineHeight: '1.5',
          }}
        >
          {isSickLeave ? (
            <>
              Please upload a medical certificate or doctor's note for this{' '}
              {leaveTypeName.toLowerCase()} request.
              {maxDays && maxDays > 1 && (
                <> Medical documentation is required for leaves exceeding {maxDays} day{maxDays > 1 ? 's' : ''}.</>
              )}
            </>
          ) : (
            <>
              This leave type requires supporting documentation. Please upload the
              required document(s) when submitting your request.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Medical Hint component
