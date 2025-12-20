import React, { useState } from 'react';
import { useMyHistory } from '../../hooks/queries/useMyHistory';
import { LeaveHistoryTable } from '../../components/my-leaves/LeaveHistoryTable';
import HistoryFiltersBar from '../../components/my-leaves/HistoryFiltersBar';
import type { LeaveStatus } from '../../types';

import type { LeaveRequest } from '../../types';

type HistoryFilters = {
  startDate?: string;
  endDate?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
};

interface HistorySectionProps {
  onViewDetails?: (request: LeaveRequest) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onViewDetails }) => {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const { history, isLoading } = useMyHistory(filters);

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Leave History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <HistoryFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          leaveTypes={[]} // TODO: Fetch leave types
          onClearFilters={() => setFilters({})}
        />
        <LeaveHistoryTable
          requests={history?.requests?.map(entry => entry.request) || []}
          loading={isLoading}
          onViewDetails={onViewDetails}
        />
      </div>
    </div>
  );
};
