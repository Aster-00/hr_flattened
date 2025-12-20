'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { useAllRequests } from '../hooks/queries/useAllRequests';
import { useLeaveTypes } from '../hooks/queries/useLeaveTypes';
import { AllRequestsTable } from '../components/hr/AllRequestsTable';
import { RunJobsPanel } from '../components/hr/RunJobsPanel';
import { HrApproveModal } from '../components/hr/HrDecisionModals/HrApproveModal';
import { HrRejectModal } from '../components/hr/HrDecisionModals/HrRejectModal';
import { HrFinalizeModal } from '../components/hr/HrDecisionModals/HrFinalizeModal';
import { HrOverrideModal } from '../components/hr/HrDecisionModals/HrOverrideModal';
import { FlagIrregularModal } from '../components/hr/FlagIrregularModal';
import { RequestDetailsDrawer } from '../components/common/RequestDetailsDrawer';
import { ManualAdjustmentModal } from '../components/hr/ManualAdjustmentModal';
import type { LeaveRequest } from '../types';
import { checkAuth, User, hasRole as checkUserRole } from '@/app/lib/auth';
import { useEffect } from 'react';
import { getAllEmployees, Employee } from '../api/employees.api';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const { requests, isLoading, refetch } = useAllRequests();
  const { types: leaveTypes } = useLeaveTypes();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    checkAuth().then(setUser);
    // Fetch employees for manual adjustment modal
    getAllEmployees().then(setEmployees).catch(console.error);
  }, []);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'pending' | 'system'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFlagged, setShowFlagged] = useState(false);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const [approveModal, setApproveModal] = useState<{ open: boolean; request?: LeaveRequest }>({ open: false });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; request?: LeaveRequest }>({ open: false });
  const [finalizeModal, setFinalizeModal] = useState<{ open: boolean; request?: LeaveRequest }>({ open: false });
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; request?: LeaveRequest }>({ open: false });
  const [flagModal, setFlagModal] = useState<{ open: boolean; request?: LeaveRequest }>({ open: false });
  const [adjustmentModal, setAdjustmentModal] = useState<{ open: boolean; employeeId?: string; employeeName?: string }>({ open: false });

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let filtered = requests;
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((r: LeaveRequest) => r.status === statusFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((r: LeaveRequest) => 
        (r.employeeId as any)?.firstName?.toLowerCase().includes(lower) ||
        (r.employeeId as any)?.lastName?.toLowerCase().includes(lower)
      );
    }
    if (showFlagged) {
      filtered = filtered.filter((r: LeaveRequest) => r.irregularPatternFlag);
    }
    return filtered;
  }, [requests, statusFilter, searchTerm, showFlagged]);

  const pendingCount = requests?.filter((r: LeaveRequest) => r.status === 'pending').length || 0;
  const approvedCount = requests?.filter((r: LeaveRequest) => r.status === 'approved').length || 0;
  const flaggedCount = requests?.filter((r: LeaveRequest) => r.irregularPatternFlag).length || 0;

  const handleSuccess = () => {
    refetch();
    setApproveModal({ open: false });
    setRejectModal({ open: false });
    setFinalizeModal({ open: false });
    setOverrideModal({ open: false });
    setFlagModal({ open: false });
    setAdjustmentModal({ open: false });
  };

  const isHR = checkUserRole(user, 'HR Manager') || checkUserRole(user, 'HR Admin') || checkUserRole(user, 'System Admin');

  if (!isHR) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)' }}>HR access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaves-container">
      {/* Modern Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--leaves-600) 0%, var(--leaves-700) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '2rem'
      }}>
        <div className="leaves-content" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>HR Command Center</h1>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage and oversee all leave requests</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setAdjustmentModal({ open: true })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manual Adjustment
                </button>
                <button
                  onClick={() => refetch()}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', fontWeight: '500' }}>Total</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{requests?.length || 0}</p>
              </div>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>Pending</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{pendingCount}</p>
              </div>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>Approved</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{approvedCount}</p>
              </div>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>Finalized</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{requests?.filter((r: LeaveRequest) => r.status === 'finalized').length || 0}</p>
              </div>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>Rejected</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{requests?.filter((r: LeaveRequest) => r.status === 'rejected').length || 0}</p>
              </div>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(156, 163, 175, 0.2)',
                  border: '1px solid rgba(156, 163, 175, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>Cancelled</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{requests?.filter((r: LeaveRequest) => r.status === 'cancelled').length || 0}</p>
              </div>
              <div 
                style={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(249, 115, 22, 0.2)',
                  border: '1px solid rgba(249, 115, 22, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', fontWeight: '500' }}>Flagged</span>
                  <svg style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{flaggedCount}</p>
              </div>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="leaves-content" style={{ paddingBottom: '3rem' }}>
        {/* Tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              borderRadius: '0.75rem',
              padding: '0.25rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                ...(activeTab === 'overview' ? {
                  backgroundColor: 'var(--leaves-600)',
                  color: 'white',
                  boxShadow: 'var(--shadow-sm)',
                } : { backgroundColor: 'transparent', color: 'var(--text-secondary)' })
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                ...(activeTab === 'all' ? {
                  backgroundColor: 'var(--leaves-600)',
                  color: 'white',
                  boxShadow: 'var(--shadow-sm)',
                } : { backgroundColor: 'transparent', color: 'var(--text-secondary)' })
              }}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                ...(activeTab === 'pending' ? {
                  backgroundColor: 'var(--leaves-600)',
                  color: 'white',
                  boxShadow: 'var(--shadow-sm)',
                } : { backgroundColor: 'transparent', color: 'var(--text-secondary)' })
              }}
            >
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                ...(activeTab === 'system' ? {
                  backgroundColor: 'var(--leaves-600)',
                  color: 'white',
                  boxShadow: 'var(--shadow-sm)',
                } : { backgroundColor: 'transparent', color: 'var(--text-secondary)' })
              }}
            >
              System Jobs
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Row - Status Distribution & Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Status Distribution Chart */}
              <div style={{ gridColumn: 'span 2', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Status Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { status: 'Pending', count: pendingCount, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
                    { status: 'Approved', count: approvedCount, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
                    { status: 'Finalized', count: requests?.filter((r: LeaveRequest) => r.status === 'finalized').length || 0, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
                    { status: 'Rejected', count: requests?.filter((r: LeaveRequest) => r.status === 'rejected').length || 0, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
                    { status: 'Cancelled', count: requests?.filter((r: LeaveRequest) => r.status === 'cancelled').length || 0, color: '#9ca3af', bgColor: 'rgba(156, 163, 175, 0.1)' },
                  ].map(item => {
                    const percentage = requests?.length ? (item.count / requests.length) * 100 : 0;
                    return (
                      <div key={item.status}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.status}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{percentage.toFixed(1)}%</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', minWidth: '48px', textAlign: 'right' }}>{item.count}</span>
                          </div>
                        </div>
                        <div style={{ position: 'relative', height: '12px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: item.bgColor }}>
                          <div 
                            style={{ 
                              position: 'absolute',
                              inset: '0 auto 0 0',
                              borderRadius: '9999px',
                              transition: 'all 0.5s',
                              width: `${percentage}%`, 
                              backgroundColor: item.color,
                              boxShadow: `0 0 8px ${item.color}40`
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'linear-gradient(to bottom right, rgb(254, 243, 199), rgb(253, 230, 138))', borderRadius: '16px', padding: '24px', border: '1px solid rgb(252, 211, 77)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(146, 64, 14)' }}>Approval Rate</span>
                    <svg style={{ width: '20px', height: '20px', color: 'rgb(217, 119, 6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '30px', fontWeight: 'bold', color: 'rgb(120, 53, 15)' }}>{requests?.length ? Math.round((approvedCount / requests.length) * 100) : 0}%</p>
                  <p style={{ fontSize: '12px', color: 'rgb(161, 98, 7)', marginTop: '4px' }}>{approvedCount} of {requests?.length || 0} requests</p>
                </div>

                <div style={{ background: 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(219, 234, 254))', borderRadius: '16px', padding: '24px', border: '1px solid rgb(191, 219, 254)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(30, 64, 175)' }}>Avg Response Time</span>
                    <svg style={{ width: '20px', height: '20px', color: 'rgb(37, 99, 235)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '30px', fontWeight: 'bold', color: 'rgb(30, 58, 138)' }}>2.4<span style={{ fontSize: '18px' }}>hrs</span></p>
                  <p style={{ fontSize: '12px', color: 'rgb(29, 78, 216)', marginTop: '4px' }}>Last 7 days average</p>
                </div>

                <div style={{ background: 'linear-gradient(to bottom right, rgb(250, 245, 255), rgb(243, 232, 255))', borderRadius: '16px', padding: '24px', border: '1px solid rgb(233, 213, 255)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(91, 33, 182)' }}>Peak Period</span>
                    <svg style={{ width: '20px', height: '20px', color: 'rgb(124, 58, 237)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'rgb(76, 29, 149)' }}>December</p>
                  <p style={{ fontSize: '12px', color: 'rgb(109, 40, 217)', marginTop: '4px' }}>Most requests this month</p>
                </div>
              </div>
            </div>

            {/* Bottom Row - Recent Activity & Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {/* Recent Activity */}
              <div style={{ gridColumn: 'span 2', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Recent Activity</h3>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Last 5 requests</span>
                </div>
                {requests && requests.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {requests.slice(0, 5).map(req => (
                      <div 
                        key={req._id.toString()} 
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '1px solid transparent',
                          backgroundColor: 'var(--bg-secondary)'
                        }} 
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                          <div 
                            style={{ 
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600',
                              color: 'white',
                              backgroundColor: 'var(--leaves-600)' 
                            }}
                          >
                            {((req as any).employee?.name || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{(req as any).employee?.name || `Employee ${req.employeeId.toString().slice(-6)}`}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{req.leaveType?.name || 'Leave Request'}</span>
                              <span>•</span>
                              <span>{new Date(req.dates.from).toLocaleDateString()}</span>
                              {req.durationDays && (
                                <>
                                  <span>•</span>
                                  <span>{req.durationDays} days</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: req.status === 'approved' ? 'var(--status-approved-bg)' : 
                                          req.status === 'pending' ? 'var(--status-pending-bg)' : 
                                          req.status === 'rejected' ? 'var(--status-rejected-bg)' : 
                                          req.status === 'finalized' ? 'rgba(59, 130, 246, 0.1)' :
                                          'var(--bg-secondary)',
                          color: req.status === 'approved' ? 'var(--status-approved-text)' : 
                                req.status === 'pending' ? 'var(--status-pending-text)' : 
                                req.status === 'rejected' ? 'var(--status-rejected-text)' : 
                                req.status === 'finalized' ? '#3b82f6' :
                                'inherit'
                        }}>
                          {req.status.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                    <svg style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'var(--border-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No leave requests yet</p>
                  </div>
                )}
              </div>

              {/* Actions Required */}
              <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Actions Required</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => setActiveTab('pending')}
                    style={{ 
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      transition: 'background-color 0.2s',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500' }}>Pending Review</span>
                      <span style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', backgroundColor: 'rgb(254, 243, 199)', color: 'rgb(161, 98, 7)' }}>{pendingCount}</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('all');
                      setShowFlaggedOnly(true);
                    }}
                    style={{ 
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      transition: 'background-color 0.2s',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '500' }}>Flagged Items</span>
                      <span style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', backgroundColor: 'rgb(254, 226, 226)', color: 'rgb(185, 28, 28)' }}>{flaggedCount}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'system' ? (
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>System Jobs</h3>
            <RunJobsPanel />
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-light)' }}>
            {/* Filters */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  outline: 'none'
                }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  outline: 'none'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="finalized">Finalized</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setShowFlagged(!showFlagged)}
                style={{ 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: showFlagged ? '1px solid transparent' : '1px solid var(--border-light)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: showFlagged ? '#ef4444' : 'var(--bg-primary)',
                  color: showFlagged ? 'white' : 'inherit'
                }}
              >
                {showFlagged ? '✓ Flagged Only' : 'Show Flagged'}
              </button>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                <div style={{ width: '64px', height: '64px', border: '4px solid var(--border-light)', borderTopColor: 'var(--payroll)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No requests found</p>
              </div>
            ) : (
              <AllRequestsTable
                requests={activeTab === 'pending' ? filteredRequests.filter((r: LeaveRequest) => r.status === 'pending') : filteredRequests}
                loading={isLoading}
                onViewDetails={setSelectedRequest}
                onApprove={(req: any) => setApproveModal({ open: true, request: req })}
                onReject={(req: any) => setRejectModal({ open: true, request: req })}
                onFinalize={(req: any) => setFinalizeModal({ open: true, request: req })}
                onOverride={(req: any) => setOverrideModal({ open: true, request: req })}
                onFlagIrregular={(req: any) => setFlagModal({ open: true, request: req })}
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <HrApproveModal
        isOpen={approveModal.open}
        requestId={approveModal.request?._id || ''}
        employeeName={(approveModal.request?.employeeId as any)?.firstName || ''}
        onClose={() => setApproveModal({ open: false })}
        onSuccess={handleSuccess}
      />
      <HrRejectModal
        isOpen={rejectModal.open}
        requestId={rejectModal.request?._id || ''}
        employeeName={(rejectModal.request?.employeeId as any)?.firstName || ''}
        onClose={() => setRejectModal({ open: false })}
        onSuccess={handleSuccess}
      />
      <HrFinalizeModal
        isOpen={finalizeModal.open}
        requestId={finalizeModal.request?._id || ''}
        employeeName={(finalizeModal.request?.employeeId as any)?.firstName || ''}
        onClose={() => setFinalizeModal({ open: false })}
        onSuccess={handleSuccess}
      />
      <HrOverrideModal
        isOpen={overrideModal.open}
        requestId={overrideModal.request?._id || ''}
        employeeName={(overrideModal.request?.employeeId as any)?.firstName || ''}
        onClose={() => setOverrideModal({ open: false })}
        onSuccess={handleSuccess}
      />
      <FlagIrregularModal
        isOpen={flagModal.open}
        requestId={flagModal.request?._id || ''}
        employeeName={(flagModal.request?.employeeId as any)?.firstName || ''}
        onClose={() => setFlagModal({ open: false })}
        onSuccess={handleSuccess}
      />
      {adjustmentModal.open && (
        <ManualAdjustmentModal
          isOpen={adjustmentModal.open}
          employeeId={adjustmentModal.employeeId || (employees[0]?._id || '')}
          employeeName={adjustmentModal.employeeName || (employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : '')}
          leaveTypes={(leaveTypes || []).map(lt => ({ _id: lt._id, name: lt.name, code: lt.code }))}
          onClose={() => setAdjustmentModal({ open: false })}
          onSuccess={handleSuccess}
        />
      )}
      <RequestDetailsDrawer
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
