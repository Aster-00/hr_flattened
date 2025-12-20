import React, { useState } from 'react';
import { useRunAccrual } from '../../hooks/mutations/useRunAccrual';
import { useRunCarryForward } from '../../hooks/mutations/useRunCarryForward';
import { useRunEscalation } from '../../hooks/mutations/useRunEscalation';
import { showToast } from '@/app/lib/toast';

export const RunJobsPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const runAccrual = useRunAccrual();
  const runCarryForward = useRunCarryForward();
  const runEscalation = useRunEscalation();


  const handleRunAccrual = async () => {
    if (!confirm('Run monthly accrual job? This will update all employee balances.')) return;
    try {
      // TODO: Uncomment when Sara implements mutation
      // await runAccrual.mutateAsync({ year: selectedYear });
      await runAccrual.mutateAsync();
      showToast('Accrual job completed successfully', 'success');
    } catch (error) {
      showToast('Accrual job failed', 'error');
    }
  };

  const handleRunCarryForward = async () => {
    if (!confirm('Run year-end carry-forward? This applies carry-forward rules and resets balances.')) return;
    try {
      // TODO: Uncomment when Sara implements mutation
      // await runCarryForward.mutateAsync({ year: selectedYear });
      await runCarryForward.mutateAsync();
      showToast('Carry-forward job completed successfully', 'success');
    } catch (error) {
      showToast('Carry-forward job failed', 'error');
    }
  };

  const handleRunEscalation = async () => {
    if (!confirm('Run auto-escalation? Pending requests > 48h will be escalated.')) return;
    try {
      await runEscalation.mutateAsync();
      showToast('Escalation job completed successfully', 'success');
    } catch (error) {
      showToast('Escalation job failed', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Automated Jobs</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Run system-wide leave management jobs. These operations affect all employees.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Year Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px' }}>Target Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', outline: 'none' }}
          >
            {[...Array(3)].map((_, i) => {
              const year = new Date().getFullYear() - 1 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        {/* Accrual Job */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>Monthly Accrual</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Accrues leave days for all eligible employees based on their vacation packages.
              </p>
            </div>
            <button
              onClick={handleRunAccrual}
              disabled={runAccrual.isPending}
              style={{ 
                marginLeft: '16px',
                padding: '8px 16px',
                backgroundColor: runAccrual.isPending ? 'var(--border-light)' : '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: runAccrual.isPending ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !runAccrual.isPending && (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !runAccrual.isPending && (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              {runAccrual.isPending ? 'Running...' : 'Run Accrual'}
            </button>
          </div>
        </div>

        {/* Carry Forward Job */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>Year-End Carry Forward</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Applies carry-forward caps and resets annual leave balances for new cycle.
              </p>
            </div>
            <button
              onClick={handleRunCarryForward}
              disabled={runCarryForward.isPending}
              style={{ 
                marginLeft: '16px',
                padding: '8px 16px',
                backgroundColor: runCarryForward.isPending ? 'var(--border-light)' : '#16a34a',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: runCarryForward.isPending ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !runCarryForward.isPending && (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseLeave={(e) => !runCarryForward.isPending && (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              {runCarryForward.isPending ? 'Running...' : 'Run Carry Forward'}
            </button>
          </div>
        </div>

        {/* Escalation Job */}
        <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>Auto-Escalation</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Escalates pending requests that have exceeded the 48-hour approval window.
              </p>
            </div>
            <button
              onClick={handleRunEscalation}
              disabled={runEscalation.isPending}
              style={{ 
                marginLeft: '16px',
                padding: '8px 16px',
                backgroundColor: runEscalation.isPending ? 'var(--border-light)' : '#ea580c',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: runEscalation.isPending ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !runEscalation.isPending && (e.currentTarget.style.backgroundColor = '#c2410c')}
              onMouseLeave={(e) => !runEscalation.isPending && (e.currentTarget.style.backgroundColor = '#ea580c')}
            >
              {runEscalation.isPending ? 'Running...' : 'Run Escalation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
