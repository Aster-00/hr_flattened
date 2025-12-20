'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useMyBalances } from '../hooks/queries/useMyBalances';
import { useMyRequests } from '../hooks/queries/useMyRequests';
import LeaveBalanceCard from '../components/my-leaves/LeaveBalanceCard';
import { MyRequestsTable } from '../components/my-leaves/MyRequestsTable';
import { RequestDetailsDrawer } from '../components/common/RequestDetailsDrawer';
import NewRequestModal from '../components/modals';
import EditRequestModal from '../components/modals/EditRequestModal';
import type { LeaveRequest } from '../types';

function MyLeavesPageContent() {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { balances, isLoading: balancesLoading, refetch: refetchBalances } = useMyBalances();
  const { requests: rawRequests, isLoading: requestsLoading, refetch: refetchRequests } = useMyRequests();

  const requests = rawRequests || [];

  // Get unique leave types from requests
  const leaveTypes = useMemo(() => {
    const types = new Map();
    requests.forEach(r => {
      if (r.leaveType && r.leaveType._id) {
        types.set(r.leaveType._id, r.leaveType.name);
      }
    });
    return Array.from(types.entries()).map(([id, name]) => ({ id, name }));
  }, [requests]);

  // Filter requests based on status, leave type, and date range
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Leave type filter
    if (leaveTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.leaveType?._id === leaveTypeFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(r => {
        const requestDate = new Date(r.dates.from);
        return requestDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(r => {
        const requestDate = new Date(r.dates.to);
        return requestDate <= new Date(dateTo);
      });
    }

    return filtered;
  }, [requests, statusFilter, leaveTypeFilter, dateFrom, dateTo]);

  const pendingCount = requests.filter(r => ['pending', 'approved'].includes(r.status)).length;
  const totalDaysUsed = requests
    .filter(r => r.status === 'finalized')
    .reduce((sum: number, r) => sum + (r.durationDays || 0), 0);

  // Handle modal close and refresh data
  const handleModalClose = () => {
    setEditingRequest(null);
    setShowNewRequestModal(false);
    // Refresh data after a short delay to ensure backend has processed
    setTimeout(() => {
      refetchBalances();
      refetchRequests();
    }, 500);
  };

  return (
    <div className="leaves-container">
      {/* Modern Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
        marginBottom: '2rem'
      }}>
        <div className="leaves-content" style={{ padding: '2rem 1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--gray-900)',
                marginBottom: '0.5rem'
              }}>
                My Leaves
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'var(--gray-500)'
              }}>
                Manage your time off and leave balances
              </p>
            </div>
            
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="leaves-btn leaves-btn-primary leaves-btn-lg"
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Time Off
            </button>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="leaves-stat-label">Available</div>
              {balancesLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '5rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: 'var(--leaves-600)' }}>
                    {balances?.totalAvailable || 0}
                  </div>
                  <div className="leaves-stat-sublabel">days remaining</div>
                </>
              )}
            </div>

            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="leaves-stat-label">Pending</div>
              {requestsLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '5rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: 'var(--status-pending)' }}>
                    {pendingCount}
                  </div>
                  <div className="leaves-stat-sublabel">requests awaiting approval</div>
                </>
              )}
            </div>

            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="leaves-stat-label">Used This Year</div>
              {requestsLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '5rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: 'var(--gray-700)' }}>
                    {totalDaysUsed}
                  </div>
                  <div className="leaves-stat-sublabel">days taken</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="leaves-content" style={{ paddingBottom: '3rem' }}>
        {/* Leave Balances Section */}
        <section className="leaves-animate-slide-up" style={{ animationDelay: '0.4s', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--gray-900)',
            marginBottom: '1rem'
          }}>
            Leave Balances
          </h2>
          
          {balancesLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="leaves-card" style={{ padding: '1.5rem' }}>
                  <div className="leaves-skeleton" style={{ height: '1.5rem', width: '60%', marginBottom: '1rem' }}></div>
                  <div className="leaves-skeleton" style={{ height: '3rem', width: '40%', marginBottom: '0.5rem' }}></div>
                  <div className="leaves-skeleton" style={{ height: '1rem', width: '80%' }}></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {balances?.entitlements?.map((entitlement: any, index: number) => (
                <LeaveBalanceCard key={entitlement._id} entitlement={entitlement} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Requests Section */}
        <section className="leaves-animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--gray-900)'
            }}>
              My Requests
              {statusFilter !== 'all' && (
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: 'var(--gray-500)',
                  marginLeft: '0.5rem'
                }}>
                  ({filteredRequests.length})
                </span>
              )}
            </h2>
            <div style={{ position: 'relative' }}>
              <button
                className="leaves-btn leaves-btn-ghost leaves-btn-sm"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  backgroundColor: (statusFilter !== 'all' || leaveTypeFilter !== 'all' || dateFrom || dateTo) ? 'var(--leaves-50)' : undefined,
                  color: (statusFilter !== 'all' || leaveTypeFilter !== 'all' || dateFrom || dateTo) ? 'var(--leaves-600)' : undefined,
                  borderColor: (statusFilter !== 'all' || leaveTypeFilter !== 'all' || dateFrom || dateTo) ? 'var(--leaves-300)' : undefined,
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              {(statusFilter !== 'all' || leaveTypeFilter !== 'all' || dateFrom || dateTo) && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--leaves-500)',
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px white'
                }}>
                  {[statusFilter !== 'all', leaveTypeFilter !== 'all', dateFrom, dateTo].filter(Boolean).length}
                </span>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="leaves-card leaves-animate-slide-down" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Status Filter */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.75rem', display: 'block' }}>
                    Status
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'rejected', label: 'Rejected' },
                      { value: 'finalized', label: 'Finalized' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setStatusFilter(value)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: 'none',
                          background: statusFilter === value ? 'var(--leaves-500)' : 'var(--gray-100)',
                          color: statusFilter === value ? 'white' : 'var(--gray-700)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (statusFilter !== value) {
                            e.currentTarget.style.background = 'var(--gray-200)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (statusFilter !== value) {
                            e.currentTarget.style.background = 'var(--gray-100)';
                          }
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leave Type Filter */}
                {leaveTypes.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.75rem', display: 'block' }}>
                      Leave Type
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setLeaveTypeFilter('all')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: 'none',
                          background: leaveTypeFilter === 'all' ? 'var(--leaves-500)' : 'var(--gray-100)',
                          color: leaveTypeFilter === 'all' ? 'white' : 'var(--gray-700)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (leaveTypeFilter !== 'all') {
                            e.currentTarget.style.background = 'var(--gray-200)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (leaveTypeFilter !== 'all') {
                            e.currentTarget.style.background = 'var(--gray-100)';
                          }
                        }}
                      >
                        All Types
                      </button>
                      {leaveTypes.map(({ id, name }) => (
                        <button
                          key={id}
                          onClick={() => setLeaveTypeFilter(id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-lg)',
                            border: 'none',
                            background: leaveTypeFilter === id ? 'var(--leaves-500)' : 'var(--gray-100)',
                            color: leaveTypeFilter === id ? 'white' : 'var(--gray-700)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (leaveTypeFilter !== id) {
                              e.currentTarget.style.background = 'var(--gray-200)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (leaveTypeFilter !== id) {
                              e.currentTarget.style.background = 'var(--gray-100)';
                            }
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Range Filter */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.75rem', display: 'block' }}>
                    Date Range
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--gray-600)', marginBottom: '0.5rem', display: 'block' }}>
                        From
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.875rem',
                          color: 'var(--gray-700)',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--gray-600)', marginBottom: '0.5rem', display: 'block' }}>
                        To
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.875rem',
                          color: 'var(--gray-700)',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(statusFilter !== 'all' || leaveTypeFilter !== 'all' || dateFrom || dateTo) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setLeaveTypeFilter('all');
                        setDateFrom('');
                        setDateTo('');
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-300)',
                        background: 'white',
                        color: 'var(--gray-700)',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--gray-50)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="leaves-card">
            {requestsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="leaves-spinner" style={{ width: '2rem', height: '2rem', margin: '0 auto' }}></div>
                <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <svg style={{ width: '4rem', height: '4rem', margin: '0 auto', color: 'var(--gray-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-700)' }}>
                  {statusFilter === 'all' ? 'No leave requests yet' : `No ${statusFilter} requests`}
                </h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--gray-500)' }}>
                  {statusFilter === 'all' 
                    ? 'Click "Request Time Off" to create your first leave request'
                    : 'Try changing the filter to see other requests'
                  }
                </p>
              </div>
            ) : (
              <MyRequestsTable
                requests={filteredRequests}
                onModify={setEditingRequest}
                onViewDetails={setSelectedRequest}
              />
            )}
          </div>
        </section>
      </div>

      {/* Request Details Drawer */}
      <RequestDetailsDrawer
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={showNewRequestModal}
        onClose={handleModalClose}
      />

      {/* Edit Request Modal */}
      {editingRequest && (
        <EditRequestModal
          isOpen={!!editingRequest}
          onClose={handleModalClose}
          request={editingRequest}
        />
      )}
    </div>
  );
}

export default function Page() {
  return <MyLeavesPageContent />;
}
