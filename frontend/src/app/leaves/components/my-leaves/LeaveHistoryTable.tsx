import React from 'react';
import type { LeaveRequest } from '../../types';
import LeaveStatusBadge from '../common/LeaveStatusBadge';
import LeaveTypeChip from '../common/LeaveTypeChip';
import { formatDate } from '../../utils/dates';

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  onViewDetails?: (request: LeaveRequest) => void;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  requests,
  loading,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No leave history found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <LeaveTypeChip 
                     leaveType={(request.leaveType || request.leaveTypeId) as any}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(request.dates.from)} - {formatDate(request.dates.to)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{request.durationDays}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LeaveStatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(request)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder - can be enhanced */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{requests.length}</span> results
        </p>
      </div>
    </div>
  );
};
