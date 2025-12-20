'use client';

import { LeaveEntitlement } from '../../types/leaves.types';
import { formatDuration, formatPercentage } from '../../utils/format';
import LeaveTypeChip from '../common/LeaveTypeChip';
import '../../leaves-theme.css';

interface LeaveBalanceCardProps {
  entitlement: LeaveEntitlement;
  className?: string;
  onRequestLeave?: () => void;
}

export default function LeaveBalanceCard({
  entitlement,
  className = '',
  onRequestLeave,
}: LeaveBalanceCardProps) {
  const usagePercentage =
    entitlement.yearlyEntitlement > 0
      ? (entitlement.taken / entitlement.yearlyEntitlement) * 100
      : 0;

  return (
    <div className={`leaves-card ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ transition: 'all 0.3s' }}>
          <LeaveTypeChip
            leaveType={{
              code: entitlement.leaveType?.code || '',
              name: entitlement.leaveType?.name || '',
            }}
            size="medium"
          />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--leaves-600)' }} className="leaves-animate-fadeIn">
            {formatDuration(entitlement.remaining)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
            Available
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: '500', marginBottom: '0.5rem' }}>
          <span>Usage</span>
          <span style={{ color: 'var(--leaves-600)', fontWeight: '600' }}>{formatPercentage(usagePercentage / 100)}</span>
        </div>
        <div className="leaves-progress">
          <div
            className="leaves-progress-bar"
            style={{
              width: `${Math.min(usagePercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--gray-50)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '500', marginBottom: '0.5rem' }}>Total</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
            {formatDuration(entitlement.yearlyEntitlement)}
          </div>
        </div>

        <div style={{ backgroundColor: '#EFF6FF', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #DBEAFE' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '500', marginBottom: '0.5rem' }}>Used</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563EB' }}>
            {formatDuration(entitlement.taken)}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFBEB', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #FEF3C7' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: '500', marginBottom: '0.5rem' }}>Pending</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F59E0B' }}>
            {formatDuration(entitlement.pending || 0)}
          </div>
        </div>
      </div>

      {onRequestLeave && (
        <button
          onClick={onRequestLeave}
          className="leaves-btn leaves-btn-primary"
          style={{ width: '100%' }}
        >
          Request Leave
        </button>
      )}
    </div>
  );
}
