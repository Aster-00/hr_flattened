import React, { useState } from 'react';

interface BalanceTooltipProps {
  availableBalance: number;
  roundingRule?: string;
  roundingMinUnit?: number;
}

export default function BalanceTooltip({ 
  availableBalance, 
  roundingRule = 'ALWAYS_ROUND_UP',
  roundingMinUnit = 0.5
}: BalanceTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getRoundingExplanation = (rule: string) => {
    switch (rule) {
      case 'ALWAYS_ROUND_UP':
        return 'Always Round Up';
      case 'ALWAYS_ROUND_DOWN':
        return 'Always Round Down';
      case 'ARITHMETIC_ROUNDING':
        return 'Arithmetic Rounding (0.5 rounds up)';
      case 'ROUND_TO_NEAREST_HALF':
        return 'Round to Nearest Half Day';
      case 'ROUND_TO_NEAREST_QUARTER':
        return 'Round to Nearest Quarter Day';
      case 'NO_ROUNDING':
        return 'No Rounding (Exact Balance)';
      default:
        return 'Standard Rounding';
    }
  };

  const getDetailedExplanation = (rule: string) => {
    switch (rule) {
      case 'ALWAYS_ROUND_UP':
        return 'Fractional days are always rounded up to the next whole day in your favor. For example, 15.3 days becomes 16 days.';
      case 'ALWAYS_ROUND_DOWN':
        return 'Fractional days are always rounded down to the previous whole day. For example, 15.7 days becomes 15 days.';
      case 'ARITHMETIC_ROUNDING':
        return 'Standard arithmetic rounding is used: 0.5 and above rounds up, below 0.5 rounds down. For example, 15.5 days becomes 16 days, 15.4 days becomes 15 days.';
      case 'ROUND_TO_NEAREST_HALF':
        return 'Balance is rounded to the nearest 0.5 days. For example, 15.3 days becomes 15.5 days, 15.7 days becomes 15.5 days.';
      case 'ROUND_TO_NEAREST_QUARTER':
        return 'Balance is rounded to the nearest 0.25 days. For example, 15.3 days becomes 15.25 days, 15.4 days becomes 15.5 days.';
      case 'NO_ROUNDING':
        return 'Your exact balance is displayed without any rounding. All fractional days are preserved.';
      default:
        return 'Your balance follows the organization\'s configured rounding policy.';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        style={{
          padding: '0.25rem',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'transparent',
          color: 'var(--gray-400)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          setShowTooltip(true);
          e.currentTarget.style.background = 'var(--gray-100)';
          e.currentTarget.style.color = 'var(--leaves-600)';
        }}
        onMouseLeave={(e) => {
          setShowTooltip(false);
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--gray-400)';
        }}
        aria-label="Balance information"
      >
        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 0.5rem)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: '20rem',
          maxWidth: '90vw',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          background: 'white',
          border: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'tooltip-fade-in 0.2s ease-out'
        }}>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-0.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '0.5rem solid transparent',
            borderRight: '0.5rem solid transparent',
            borderTop: '0.5rem solid white',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-0.6rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '0.55rem solid transparent',
            borderRight: '0.55rem solid transparent',
            borderTop: '0.55rem solid var(--gray-200)',
            zIndex: -1
          }}></div>

          {/* Content */}
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
              Available Balance
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--leaves-700)' }}>
              {availableBalance} days
            </p>
          </div>

          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--leaves-50)',
            marginBottom: '0.75rem'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--leaves-700)', marginBottom: '0.25rem' }}>
              Rounding Policy
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-700)' }}>
              {getRoundingExplanation(roundingRule)}
            </p>
          </div>

          <p style={{ fontSize: '0.7rem', color: 'var(--gray-600)', lineHeight: '1.4' }}>
            {getDetailedExplanation(roundingRule)}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes tooltip-fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(0.25rem);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
