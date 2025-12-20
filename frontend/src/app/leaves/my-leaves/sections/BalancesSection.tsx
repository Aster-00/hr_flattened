import React from 'react';
import { useMyBalances } from '../../hooks/queries/useMyBalances';
import LeaveBalanceCard from '../../components/my-leaves/LeaveBalanceCard';

interface BalancesSectionProps {
  onRequestLeave?: () => void;
}

export const BalancesSection: React.FC<BalancesSectionProps> = ({ onRequestLeave }) => {
  const { balances, isLoading } = useMyBalances();

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Your Leave Balances</h2>
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-light)', padding: '24px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
              <div style={{ height: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', width: '50%', marginBottom: '16px' }}></div>
              <div style={{ height: '32px', backgroundColor: '#D1D5DB', borderRadius: '4px', width: '75%' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {balances?.entitlements?.map((entitlement) => (
            <LeaveBalanceCard
              key={entitlement.leaveTypeId}
              entitlement={entitlement}
            />
          ))}
        </div>
      )}
    </div>
  );
};
