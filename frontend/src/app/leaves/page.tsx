'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../../main-theme.css';
import './leaves-theme.css';
import { useMyBalances } from './hooks/queries/useMyBalances';
import { useMyHistory } from './hooks/queries/useMyHistory';
import { checkAuth, User, hasRole as checkUserRole } from '@/app/lib/auth';

function LeavesPageContent() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    checkAuth().then(setUser);
  }, []);
  const { balances, isLoading: balancesLoading } = useMyBalances();
  const { history, isLoading: historyLoading } = useMyHistory();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Determine user role for navigation
  // Role values from backend: 'HR Manager', 'HR Admin', 'System Admin', 'department head', 'department employee'
  const userRole = checkUserRole(user, 'HR Manager') || checkUserRole(user, 'HR Admin') || checkUserRole(user, 'System Admin') 
    ? 'hr' 
    : checkUserRole(user, 'department head') 
    ? 'manager' 
    : 'employee';
  
  const requests = history?.requests || [];
  const totalAvailable = balances?.totalAvailable || 0;
  const totalUsed = balances?.totalUsed || 0;
  const totalEntitlement = (balances?.entitlements || []).reduce((sum, e: any) => sum + e.yearlyEntitlement, 0);
  const pendingCount = requests.filter(r => ['pending', 'approved'].includes(r.request.status)).length;
  const approvedCount = requests.filter(r => r.request.status === 'finalized').length;
  const usagePercentage = totalEntitlement > 0 ? (totalUsed / totalEntitlement) * 100 : 0;

  const navigationCards = [
    {
      title: 'My Leaves',
      description: 'View balances and manage requests',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/leaves/my-leaves',
      roles: ['employee', 'manager', 'hr'],
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      title: 'Team Leaves',
      description: 'Review and approve team requests',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/leaves/team',
      roles: ['manager', 'hr'],
    },
    {
      title: 'HR Admin',
      description: 'Organization-wide management',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/leaves/hr',
      roles: ['hr'],
    },
    {
      title: 'Policies',
      description: 'View policies and rules',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/leaves/policies',
      roles: ['employee', 'manager', 'hr'],
    },
    {
      title: 'Entitlements',
      description: 'Assign leave entitlements',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      href: '/leaves/entitlements',
      roles: ['hr'],
    },
  ];

  const visibleCards = navigationCards.filter(card => card.roles.includes(userRole));

  // Recent activity
  const recentActivity = requests.slice(0, 3).map(entry => ({
    id: entry.request._id,
    type: entry.leaveType?.name || 'Leave',
    status: entry.request.status,
    date: entry.request.createdAt || new Date(),
    duration: entry.request.durationDays || 0
  }));

  return (
    <div className="leaves-container">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--leaves-600) 0%, var(--leaves-700) 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
        
        <div className="leaves-content" style={{ position: 'relative', padding: '3rem 1.5rem 2rem' }}>
          <div className="leaves-animate-slide-up" style={{ maxWidth: '42rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Leave Management System
            </h1>
            <p style={{
              fontSize: '1.125rem',
              opacity: 0.95,
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Manage your time off, track balances, and stay updated with your leave requests — all in one place.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/leaves/my-leaves">
                <button className="leaves-btn leaves-btn-lg" style={{
                  background: 'white',
                  color: 'var(--leaves-700)',
                  fontWeight: '600'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request Leave
                </button>
              </Link>
              <Link href="/leaves/my-leaves">
                <button className="leaves-btn leaves-btn-lg leaves-btn-ghost" style={{
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  color: 'white'
                }}>
                  View My Leaves
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="leaves-content" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Overview Stats */}
        <section style={{ marginTop: '-3rem', marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div className="leaves-stat-label">Available Days</div>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--leaves-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--leaves-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              {balancesLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '6rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: 'var(--leaves-600)' }}>{totalAvailable}</div>
                  <div className="leaves-stat-sublabel">days remaining this year</div>
                </>
              )}
            </div>

            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div className="leaves-stat-label">Pending</div>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {historyLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '6rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: '#f59e0b' }}>{pendingCount}</div>
                  <div className="leaves-stat-sublabel">awaiting approval</div>
                </>
              )}
            </div>

            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div className="leaves-stat-label">Approved</div>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {historyLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '6rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: '#3b82f6' }}>{approvedCount}</div>
                  <div className="leaves-stat-sublabel">confirmed requests</div>
                </>
              )}
            </div>

            <div className="leaves-stat-card leaves-animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div className="leaves-stat-label">Usage</div>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--gray-600)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              {balancesLoading ? (
                <div className="leaves-skeleton" style={{ height: '3rem', width: '6rem' }}></div>
              ) : (
                <>
                  <div className="leaves-stat-value" style={{ color: 'var(--gray-700)' }}>{usagePercentage.toFixed(0)}%</div>
                  <div className="leaves-stat-sublabel">{totalUsed} of {totalEntitlement} days used</div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Quick Actions */}
          <section className="leaves-animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--gray-900)',
              marginBottom: '1.5rem'
            }}>
              Quick Access
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {visibleCards.map((card, index) => (
                <Link key={card.href} href={card.href}>
                  <div
                    className="leaves-card"
                    style={{
                      padding: '1.5rem',
                      height: '100%',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {card.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'var(--status-pending)',
                        color: 'white',
                        borderRadius: '9999px',
                        width: '1.5rem',
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {card.badge}
                      </div>
                    )}
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--leaves-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--leaves-600)',
                      marginBottom: '1rem'
                    }}>
                      {card.icon}
                    </div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--gray-900)',
                      marginBottom: '0.5rem'
                    }}>
                      {card.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--gray-500)',
                      lineHeight: '1.5'
                    }}>
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity & Leave Balance Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Recent Activity */}
            <section className="leaves-animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: '1rem'
              }}>
                Recent Activity
              </h2>
              <div className="leaves-card" style={{ padding: '1.5rem' }}>
                {historyLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="leaves-skeleton" style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)' }}></div>
                        <div style={{ flex: 1 }}>
                          <div className="leaves-skeleton" style={{ height: '1rem', width: '60%', marginBottom: '0.5rem' }}></div>
                          <div className="leaves-skeleton" style={{ height: '0.75rem', width: '40%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <svg style={{ width: '3rem', height: '3rem', margin: '0 auto', color: 'var(--gray-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p style={{ marginTop: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>No recent activity</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentActivity.map(activity => (
                      <div key={activity.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: 'var(--radius-md)',
                          background: activity.status === 'pending' ? '#fef3c7' : activity.status === 'finalized' ? 'var(--leaves-100)' : 'var(--gray-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg style={{ width: '1.25rem', height: '1.25rem', color: activity.status === 'pending' ? '#f59e0b' : activity.status === 'finalized' ? 'var(--leaves-600)' : 'var(--gray-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-900)' }}>{activity.type}</span>
                            <span className={`leaves-badge leaves-badge-${activity.status}`}>{activity.status}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            {activity.duration} day{activity.duration !== 1 ? 's' : ''} • {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/leaves/my-leaves">
                  <button className="leaves-btn leaves-btn-ghost leaves-btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
                    View All Requests
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            </section>

            {/* Leave Balance Breakdown */}
            <section className="leaves-animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: '1rem'
              }}>
                Leave Balance
              </h2>
              <div className="leaves-card" style={{ padding: '1.5rem' }}>
                {balancesLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1,2,3].map(i => (
                      <div key={i}>
                        <div className="leaves-skeleton" style={{ height: '1rem', width: '50%', marginBottom: '0.5rem' }}></div>
                        <div className="leaves-skeleton" style={{ height: '0.5rem', width: '100%' }}></div>
                      </div>
                    ))}
                  </div>
                ) : balances?.entitlements && balances.entitlements.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {balances.entitlements.slice(0, 4).map((entitlement: any) => {
                      const percentage = entitlement.yearlyEntitlement > 0 ? (entitlement.taken / entitlement.yearlyEntitlement) * 100 : 0;
                      return (
                        <div key={entitlement._id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                              {entitlement.leaveType?.name || 'Leave'}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                              {entitlement.remaining} / {entitlement.yearlyEntitlement} days
                            </span>
                          </div>
                          <div className="leaves-progress">
                            <div className="leaves-progress-bar" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>No leave balances available</p>
                  </div>
                )}
                <Link href="/leaves/my-leaves">
                  <button className="leaves-btn leaves-btn-ghost leaves-btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
                    View Full Balance
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LeavesPage() {
  return <LeavesPageContent />;
}
