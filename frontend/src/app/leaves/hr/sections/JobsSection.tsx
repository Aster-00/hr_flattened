import React from 'react';
import { RunJobsPanel } from '../../components/hr/RunJobsPanel';

export const JobsSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Automated Jobs</h2>
      <RunJobsPanel />
    </div>
  );
};
