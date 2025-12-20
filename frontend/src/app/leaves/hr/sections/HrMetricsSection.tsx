import React from 'react';
// TODO: Uncomment when Sara implements hooks
// import { useHrMetrics } from '../../hooks/queries/useHrMetrics';
import { HrMetricsCards } from '../../components/hr/HrMetricsCards';

export const HrMetricsSection: React.FC = () => {
  // TODO: Uncomment when Sara implements hook
  // const { data: metrics, isLoading } = useHrMetrics();
  const metrics = null;
  const isLoading = false;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>System Metrics</h2>
      <HrMetricsCards metrics={metrics as any} loading={isLoading} />
    </div>
  );
};
