'use client';

import React from 'react';

interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

/**
 * Wizard Stepper Component
 * Displays progress through a multi-step wizard process
 */
export default function WizardStepper({
  steps,
  currentStep,
  className = '',
}: WizardStepperProps) {
  return (
    <div
      className={className}
      style={{
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        {/* Connection Line */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1.5rem',
            right: '1.5rem',
            height: '2px',
            backgroundColor: 'var(--border-light)',
            zIndex: 0,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={step.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Step Circle */}
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: isCompleted
                    ? 'var(--success)'
                    : isActive
                      ? 'var(--leaves)'
                      : 'var(--bg-primary)',
                  color: isCompleted || isActive
                    ? 'var(--text-inverse)'
                    : 'var(--text-tertiary)',
                  border:
                    isUpcoming
                      ? '2px solid var(--border-medium)'
                      : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(16, 185, 129, 0.1)'
                    : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isCompleted ? (
                  <span>✓</span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div
                style={{
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? 'var(--leaves)'
                      : isCompleted
                        ? 'var(--text-primary)'
                        : 'var(--text-tertiary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Wizard Stepper component
