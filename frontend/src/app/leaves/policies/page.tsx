'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useLeaveTypes } from '../hooks/queries/useLeaveTypes';
import { usePolicies } from '../hooks/queries/usePolicies';
import { checkAuth, User, hasRole as checkUserRole } from '@/app/lib/auth';
import { useEffect } from 'react';
import EmptyState from '../components/common/EmptyState';
import type { LeaveType, LeavePolicy } from '../types';
import { LeaveTypesSection } from './sections/LeaveTypesSection';
import { LeavePoliciesSection } from './sections/LeavePoliciesSection';
import { EntitlementsSection } from './sections/EntitlementsSection';
import { CalendarsSection } from './sections/CalendarsSection';
import { CreateLeaveTypeModal } from '../components/modals/CreateLeaveTypeModal';
import { CreateLeavePolicyModal } from '../components/modals/CreateLeavePolicyModal';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'policies' | 'types' | 'entitlements' | 'calendars'>('policies');

  useEffect(() => {
    checkAuth().then(setUser);
  }, []);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  
  const { types, isLoading: typesLoading, refetch: refetchTypes } = useLeaveTypes();
  const { policies, isLoading: policiesLoading, refetch: refetchPolicies } = usePolicies();

  const isHR = checkUserRole(user, 'HR Manager') || checkUserRole(user, 'HR Admin') || checkUserRole(user, 'System Admin');

  const selectedPolicy: LeavePolicy | undefined = policies?.find(
    (p: LeavePolicy) => p.leaveTypeId === selectedLeaveType,
  );

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
                Leave Policies & Configuration
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'var(--gray-500)'
              }}>
                Manage leave types, policies, and entitlements
              </p>
            </div>

            {isHR && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowCreateTypeModal(true)}
                  className="leaves-btn leaves-btn-ghost leaves-btn-lg"
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Leave Type
                </button>
                <button
                  onClick={() => setShowCreatePolicyModal(true)}
                  className="leaves-btn leaves-btn-primary leaves-btn-lg"
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Policy
                </button>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
              {/* Leave Types Card */}
              <div 
                className="leaves-stat-card leaves-animate-slide-up"
                style={{
                  animationDelay: '0.1s',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    letterSpacing: '0.05em'
                  }}>LEAVE TYPES</span>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{types?.length || 0}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Total configured</p>
              </div>

              {/* Active Policies Card */}
              <div 
                className="leaves-stat-card leaves-animate-slide-up"
                style={{
                  animationDelay: '0.2s',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.3)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    letterSpacing: '0.05em'
                  }}>ACTIVE POLICIES</span>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{policies?.length || 0}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>In effect</p>
              </div>

              {/* Paid Types Card */}
              <div 
                className="leaves-stat-card leaves-animate-slide-up"
                style={{
                  animationDelay: '0.3s',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    letterSpacing: '0.05em'
                  }}>PAID LEAVE TYPES</span>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{types?.filter((t: any) => t.paidLeave).length || 0}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Compensated</p>
              </div>

              {/* Requires Approval Card */}
              <div 
                className="leaves-stat-card leaves-animate-slide-up"
                style={{
                  animationDelay: '0.4s',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  boxShadow: '0 8px 16px -4px rgba(236, 72, 153, 0.3)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    letterSpacing: '0.05em'
                  }}>REQUIRE APPROVAL</span>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{types?.filter((t: any) => t.requiresApproval).length || 0}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Needs manager OK</p>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="leaves-content" style={{ padding: '2rem 1.5rem' }}>
        {/* Modern Tabs */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex',
            borderRadius: '1rem',
            padding: '0.375rem',
            backgroundColor: 'var(--bg-primary)', 
            border: '1px solid var(--border-light)', 
            boxShadow: 'var(--shadow-sm)' 
          }}>
            {(['policies', 'types', 'entitlements', 'calendars'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                  position: 'relative',
                  backgroundColor: activeTab === tab ? 'var(--leaves-600)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {tab === 'policies' && (
                  <svg style={{ width: '1rem', height: '1rem', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {tab === 'types' && (
                  <svg style={{ width: '1rem', height: '1rem', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                )}
                {tab === 'entitlements' && (
                  <svg style={{ width: '1rem', height: '1rem', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tab === 'calendars' && (
                  <svg style={{ width: '1rem', height: '1rem', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ 
          borderRadius: '1rem',
          overflow: 'hidden',
          transition: 'all 0.3s',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {activeTab === 'policies' && (
            <div className="leaves-animate-fade-in">
              <LeavePoliciesSection />
            </div>
          )}
          
          {activeTab === 'types' && (
            <div className="leaves-animate-fade-in">
              <LeaveTypesSection />
            </div>
          )}
          
          {activeTab === 'entitlements' && (
            <div className="leaves-animate-fade-in">
              <EntitlementsSection />
            </div>
          )}
          
          {activeTab === 'calendars' && (
            <div className="leaves-animate-fade-in">
              <CalendarsSection />
            </div>
          )}
        </div>
      </div>

      {/* Modals - Always render */}
      <CreateLeaveTypeModal
        isOpen={showCreateTypeModal}
        onClose={() => setShowCreateTypeModal(false)}
        onSuccess={() => {
          refetchTypes();
          setShowCreateTypeModal(false);
        }}
      />
      
      <CreateLeavePolicyModal
        isOpen={showCreatePolicyModal}
        onClose={() => setShowCreatePolicyModal(false)}
        onSuccess={() => {
          refetchPolicies();
          setShowCreatePolicyModal(false);
        }}
      />
    </div>
  );
}
