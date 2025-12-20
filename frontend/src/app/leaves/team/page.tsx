'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useTeamBalances } from '../hooks/queries/useTeamBalances';
import { useTeamRequests } from '../hooks/queries/useTeamRequests';
import { TeamPendingApprovalsTable } from '../components/team/TeamPendingApprovalsTable';
import { TeamLeaveCalendar } from '../components/team/TeamLeaveCalendar';
import { TeamBalancesTable } from '../components/team/TeamBalancesTable';
import { RequestDetailsDrawer } from '../components/common/RequestDetailsDrawer';
import type { LeaveRequest } from '../types';
import { checkAuth, User, hasRole as checkUserRole } from '@/app/lib/auth';
import { useEffect } from 'react';

function TeamLeavesPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'calendar' | 'balances'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [showFilters, setShowFilters] = useState(false);
  const [calendarStatusFilter, setCalendarStatusFilter] = useState<string[]>(['pending', 'approved', 'finalized']);

  useEffect(() => {
    checkAuth().then(setUser);
  }, []);
  
  // Check if user has manager role (exact values from backend SystemRole enum)
  const isManager = checkUserRole(user, 'department head') || checkUserRole(user, 'HR Manager');

  // Managers should only see their team's requests
  const { requests, isLoading: requestsLoading, refetch } = useTeamRequests();
  const { teamBalances, isLoading: balancesLoading, refetch: refetchBalances } = useTeamBalances();

  // Filter requests - MUST be called before any early returns
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (statusFilter === 'all') return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  // Unauthorized access check - AFTER all hooks
  if (!isManager) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--error-light)' }}>
            <svg style={{ width: '2.5rem', height: '2.5rem', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Access Denied</h2>
          <p style={{ color: 'var(--gray-600)' }}>You do not have permission to view this page. Only managers can access team leave management.</p>
        </div>
      </div>
    );
  }

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  // For calendar: show all requests regardless of status (calendar component will filter)
  const allRequests = requests || [];
  // For "on leave today" stat: count approved/finalized leaves
  const approvedRequests = allRequests.filter(r => r.status === 'approved' || r.status === 'finalized');
  const onLeaveToday = approvedRequests.filter(r => {
    const today = new Date();
    const start = new Date(r.dates.from);
    const end = new Date(r.dates.to);
    return today >= start && today <= end;
  }).length;

  return (
    <div className="leaves-container">
      {/* Hero Header with Gradient */}
      <div style={{
        background: `linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '2rem'
      }}>
        <div className="leaves-content" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ 
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Team Leave Management</h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Review and approve leave requests from your team</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
              <div className="leaves-stat-card" style={{ 
                borderRadius: '1rem',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>Pending Approvals</p>
                  <div style={{ 
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--warning)',
                    opacity: 0.9
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>{pendingRequests.length}</p>
                {pendingRequests.length > 0 && (
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Requires action</p>
                )}
              </div>

              <div className="leaves-stat-card" style={{ 
                borderRadius: '1rem',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>Team Members</p>
                  <div style={{ 
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--info)',
                    opacity: 0.9
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>{teamBalances?.teamMembers?.length || 0}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Under your management</p>
              </div>

              <div className="leaves-stat-card" style={{ 
                borderRadius: '1rem',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>On Leave Today</p>
                  <div style={{ 
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--success)',
                    opacity: 0.9
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>{onLeaveToday}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Currently absent</p>
              </div>

              <div className="leaves-stat-card" style={{ 
                borderRadius: '1rem',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>Approved This Month</p>
                  <div style={{ 
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--secondary-500)',
                    opacity: 0.9
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>{approvedRequests.length}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Total processed</p>
              </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="leaves-content" style={{ paddingBottom: '3rem' }}>
        {/* Enhanced Tabs */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            borderRadius: '1rem',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)' 
          }}>
            <nav style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('pending')}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'pending' ? 'var(--leaves)' : 'transparent',
                  color: activeTab === 'pending' ? 'white' : 'var(--text-tertiary)',
                  boxShadow: activeTab === 'pending' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Approvals
                {pendingRequests.length > 0 && (
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: activeTab === 'pending' ? 'rgba(255, 255, 255, 0.3)' : 'var(--warning-light)',
                    color: activeTab === 'pending' ? 'white' : 'var(--warning-dark)'
                  }}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'calendar' ? 'var(--leaves)' : 'transparent',
                  color: activeTab === 'calendar' ? 'white' : 'var(--text-tertiary)',
                  boxShadow: activeTab === 'calendar' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Team Calendar
              </button>
              <button
                onClick={() => setActiveTab('balances')}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'balances' ? 'var(--leaves)' : 'transparent',
                  color: activeTab === 'balances' ? 'white' : 'var(--text-tertiary)',
                  boxShadow: activeTab === 'balances' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Team Balances
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ 
            borderRadius: '1rem',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)'
          }}>
          {activeTab === 'pending' && (
            requestsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="leaves-spinner" style={{ 
                  width: '2.5rem',
                  height: '2.5rem',
                  margin: '0 auto 1rem',
                  borderWidth: '4px',
                  borderColor: 'var(--gray-200)',
                  borderTopColor: 'var(--leaves)'
                }}></div>
                <p style={{ color: 'var(--text-tertiary)' }}>Loading pending requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--success-light)'
                }}>
                  <svg style={{ width: '2.5rem', height: '2.5rem', color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>All Caught Up!</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>
                  No pending approvals at this time. Your team is all set!
                </p>
              </div>
            ) : (
              <TeamPendingApprovalsTable
                requests={pendingRequests}
                loading={requestsLoading}
                onViewDetails={setSelectedRequest}
                onApprovalSuccess={refetch}
              />
            )
          )}

          {activeTab === 'calendar' && (
            <div style={{ padding: '1.5rem' }}>
              {/* Calendar Status Filter */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Display on Calendar:
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { value: 'pending', label: '⏳ Pending', color: '#F59E0B' },
                    { value: 'approved', label: '✅ Approved', color: '#10B981' },
                    { value: 'finalized', label: '✅ Finalized', color: '#059669' },
                    { value: 'rejected', label: '❌ Rejected', color: '#EF4444' },
                    { value: 'cancelled', label: '🚫 Cancelled', color: '#6B7280' },
                  ].map(({ value, label, color }) => {
                    const isActive = calendarStatusFilter.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          if (isActive) {
                            setCalendarStatusFilter(calendarStatusFilter.filter(s => s !== value));
                          } else {
                            setCalendarStatusFilter([...calendarStatusFilter, value]);
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: `2px solid ${isActive ? color : 'var(--border-light)'}`,
                          background: isActive ? `${color}15` : 'white',
                          color: isActive ? color : 'var(--text-tertiary)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{
                          width: '1rem',
                          height: '1rem',
                          borderRadius: '0.25rem',
                          backgroundColor: isActive ? color : 'transparent',
                          border: `2px solid ${color}`,
                          display: 'inline-block'
                        }}></span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <TeamLeaveCalendar
                requests={allRequests}
                statusFilter={calendarStatusFilter}
              />
            </div>
          )}

          {activeTab === 'balances' && (
            balancesLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="leaves-spinner" style={{ 
                  width: '2.5rem',
                  height: '2.5rem',
                  margin: '0 auto 1rem',
                  borderWidth: '4px',
                  borderColor: 'var(--gray-200)',
                  borderTopColor: 'var(--leaves)'
                }}></div>
                <p style={{ color: 'var(--text-tertiary)' }}>Loading team balances...</p>
              </div>
            ) : (
              <TeamBalancesTable
                balances={teamBalances?.teamMembers || []}
                loading={balancesLoading}
              />
            )
          )}
        </div>
      </div>

      {/* Request Details Drawer */}
      <RequestDetailsDrawer
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
export default function Page() {
  return <TeamLeavesPageContent />;
}
// Manager leave management dashboard - Professional Enterprise HR Design
