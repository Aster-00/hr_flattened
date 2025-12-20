import React from 'react';
import type { EmployeeBalance } from '../../types';
import { formatNumber } from '../../utils/format';

interface TeamBalancesTableProps {
  balances: EmployeeBalance[];
  loading?: boolean;
  onViewEmployee?: (employeeId: string) => void;
}

export const TeamBalancesTable: React.FC<TeamBalancesTableProps> = ({
  balances,
  loading,
  onViewEmployee,
}) => {
  // Debug log
  React.useEffect(() => {
    console.log('TeamBalancesTable received balances:', balances);
  }, [balances]);

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

  if (!balances || balances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F3F4F6'
        }}>
          <svg style={{ width: '2rem', height: '2rem', color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No team members found</p>
        <p className="text-gray-400 text-sm mt-2">Team balances will appear here once employees have entitlements</p>
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
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accrued
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taken
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {balances.flatMap((member) => {
              // If member has no entitlements, show a row indicating that
              if (!member.entitlements || member.entitlements.length === 0) {
                return [(
                  <tr key={member.employeeId?.toString() || member.employeeNumber} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.employeeName}</div>
                        <div className="text-sm text-gray-500">{member.employeeNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" colSpan={5}>
                      <span className="text-sm text-gray-400 italic">No entitlements configured</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {onViewEmployee && (
                        <button
                          onClick={() => onViewEmployee(member.employeeId?.toString() || '')}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                )];
              }

              return member.entitlements.map((entitlement, index) => (
                <tr key={`${member.employeeId}-${entitlement.leaveTypeId || index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.employeeName}</div>
                      <div className="text-sm text-gray-500">{member.employeeNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{entitlement.leaveType?.name || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-900">{formatNumber(entitlement.yearlyEntitlement || 0)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-red-600">{formatNumber(entitlement.taken || 0)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-orange-600">{formatNumber(entitlement.pending || 0)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-semibold ${
                      (entitlement.remaining || 0) > (entitlement.yearlyEntitlement || 0) * 0.5
                        ? 'text-green-600'
                        : (entitlement.remaining || 0) > 0
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {formatNumber(entitlement.remaining || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {onViewEmployee && index === 0 && (
                      <button
                        onClick={() => onViewEmployee(member.employeeId?.toString() || '')}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
