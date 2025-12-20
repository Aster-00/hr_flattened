// BlockedPeriodsManager component
'use client';

import React, { useState } from 'react';
import { useBlockedPeriods } from '../../hooks/queries/useBlockedPeriods';
import { useDeleteBlockedPeriod } from '../../hooks/mutations/useDeleteBlockedPeriod';
import AddBlockedPeriodModal from './AddBlockedPeriodModal';
import { formatDate } from '../../utils/dates';
import { showToast } from '@/app/lib/toast';

export default function BlockedPeriodsManager() {
  const { blockedPeriods, isLoading, refetch } = useBlockedPeriods();
  const deleteBlockedPeriod = useDeleteBlockedPeriod();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the blocked period "${name}"?`)) {
      return;
    }

    try {
      await deleteBlockedPeriod.mutateAsync(id);
      showToast('Blocked period deleted successfully', 'success');
      refetch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete blocked period';
      showToast(errorMessage, 'error');
    }
  };

  const handleAddSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '48px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
          Loading blocked periods...
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              margin: 0
            }}>
              Blocked Periods
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Manage periods when leave requests are not allowed
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Add Blocked Period
          </button>
        </div>

        {/* Table or Empty State */}
        {blockedPeriods.length === 0 ? (
          <div style={{
            padding: '64px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              📅
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#111827',
              marginBottom: '8px'
            }}>
              No blocked periods defined
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Add a blocked period to restrict leave requests during specific dates
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#3b82f6',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dbeafe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
            >
              Create Your First Blocked Period
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Period Name
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Start Date
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    End Date
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Reason
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {blockedPeriods.map((period) => (
                  <tr
                    key={period._id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#fee2e2',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          🚫
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#111827'
                          }}>
                            {period.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                      {formatDate(period.startDate)}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                      {formatDate(period.endDate)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={period.reason}
                      >
                        {period.reason}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(period._id, period.name)}
                        disabled={deleteBlockedPeriod.isPending}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#dc2626',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: deleteBlockedPeriod.isPending ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          opacity: deleteBlockedPeriod.isPending ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!deleteBlockedPeriod.isPending) {
                            e.currentTarget.style.backgroundColor = '#fecaca';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!deleteBlockedPeriod.isPending) {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                          }
                        }}
                      >
                        {deleteBlockedPeriod.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddBlockedPeriodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}
