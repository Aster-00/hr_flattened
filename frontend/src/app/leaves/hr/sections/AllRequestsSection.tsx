import React, { useState } from 'react';
import { useAllRequests } from '../../hooks/queries/useAllRequests';
import { AllRequestsTable } from '../../components/hr/AllRequestsTable';
import type { LeaveRequest } from '../../types';
// Note: FilterBar component not yet implemented
type FilterBarFilters = any;

interface AllRequestsSectionProps {
  onViewDetails?: (request: LeaveRequest) => void;
  onFinalize?: (request: LeaveRequest) => void;
  onOverride?: (request: LeaveRequest) => void;
  onFlagIrregular?: (request: LeaveRequest) => void;
}

export const AllRequestsSection: React.FC<AllRequestsSectionProps> = ({
  onViewDetails,
  onFinalize,
  onOverride,
  onFlagIrregular,
}) => {
  const [filters, setFilters] = useState<FilterBarFilters>({});
  const { requests, isLoading } = useAllRequests();

  const filteredRequests = requests?.filter((request: any) => {
    if (filters.status && filters.status !== 'All' && request.status !== filters.status) return false;
    if (filters.leaveType && request.leaveType.id !== filters.leaveType) return false;
    if (filters.search && !request.employee.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* TODO: Uncomment when Sara implements FilterBar */}
      {/* <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showDateRange
        showSearch
      /> */}
      <AllRequestsTable
        requests={filteredRequests || []}
        loading={isLoading}
        onViewDetails={onViewDetails}
        onFinalize={onFinalize}
        onOverride={onOverride}
        onFlagIrregular={onFlagIrregular}
      />
    </div>
  );
};
