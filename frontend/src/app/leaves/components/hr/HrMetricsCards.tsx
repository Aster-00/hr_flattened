import React from 'react';

interface HrMetrics {
  totalRequests: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  averageProcessingTime: number;
  flaggedPatterns: number;
}

interface HrMetricsCardsProps {
  metrics: HrMetrics | undefined;
  loading?: boolean;
}

export const HrMetricsCards: React.FC<HrMetricsCardsProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      label: 'Total Requests',
      value: metrics.totalRequests,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '📄',
    },
    {
      label: 'Pending Approvals',
      value: metrics.pendingApprovals,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: '⏳',
    },
    {
      label: 'Approved This Month',
      value: metrics.approvedThisMonth,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅',
    },
    {
      label: 'Rejected This Month',
      value: metrics.rejectedThisMonth,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '❌',
    },
    {
      label: 'Avg. Processing Time',
      value: `${metrics.averageProcessingTime}h`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '⏱️',
    },
    {
      label: 'Flagged Patterns',
      value: metrics.flaggedPatterns,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '⚠️',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{card.label}</h3>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${card.color}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};
