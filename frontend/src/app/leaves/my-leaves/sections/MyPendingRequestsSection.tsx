import React from 'react';
import { useMyHistory } from '../../hooks/queries/useMyHistory';
import { MyRequestsTable } from '../../components/my-leaves/MyRequestsTable';
import type { LeaveRequest } from '../../types';

interface MyPendingRequestsSectionProps {
  onViewDetails?: (request: LeaveRequest) => void;
}

export const MyPendingRequestsSection: React.FC<MyPendingRequestsSectionProps> = ({ onViewDetails }) => {
  const { history: requests, isLoading } = useMyHistory();
  const activeRequests = requests?.requests?.filter(entry => ['pending', 'approved'].includes(entry.request.status)).map(entry => entry.request) || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Active Requests</h2>
        <span style={{ padding: '4px 12px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '9999px', fontSize: '14px', fontWeight: 500 }}>
          {activeRequests.length} active
        </span>
      </div>
      <MyRequestsTable
        requests={activeRequests}
        loading={isLoading}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};
