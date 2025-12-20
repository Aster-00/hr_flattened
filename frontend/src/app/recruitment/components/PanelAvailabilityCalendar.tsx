"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../services';
import '../../../../main-theme.css';

interface PanelMember {
  _id: string;
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  employeeNumber?: string;
}

interface BusyPeriod {
  type: 'leave' | 'interview';
  status: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  title?: string;
  jobTitle?: string;
  candidateName?: string;
  method?: string;
  allDay: boolean;
}

interface MemberAvailability {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  busyPeriods: BusyPeriod[];
}

interface PanelAvailabilityCalendarProps {
  selectedPanelMembers: string[];
  availablePanelMembers: PanelMember[];
  proposedDate?: Date;
}

export default function PanelAvailabilityCalendar({
  selectedPanelMembers,
  availablePanelMembers,
  proposedDate,
}: PanelAvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<MemberAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPanelMembers.length > 0) {
      loadAvailability();
    } else {
      setAvailability([]);
    }
  }, [selectedPanelMembers, currentMonth]);

  const loadAvailability = async () => {
    try {
      setLoading(true);

      // Get first and last day of current month
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const data = await recruitmentApi.getPanelMemberAvailability(
        selectedPanelMembers,
        startDate,
        endDate
      );

      // Convert date strings to Date objects
      const formattedData = data.map((member: any) => ({
        ...member,
        busyPeriods: member.busyPeriods.map((period: any) => ({
          ...period,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
        })),
      }));

      setAvailability(formattedData);
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const getBusyPeriodsForDay = (memberId: string, day: Date): BusyPeriod[] => {
    const member = availability.find(m => m.memberId === memberId);
    if (!member) return [];

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return member.busyPeriods.filter(period => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);

      // Check if period overlaps with this day
      return periodStart <= dayEnd && periodEnd >= dayStart;
    });
  };

  const getMemberName = (memberId: string): string => {
    const member = availablePanelMembers.find(m => m._id === memberId);
    if (!member) return 'Unknown';
    return `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.employeeNumber || 'Unknown';
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isProposedDate = (date: Date): boolean => {
    if (!proposedDate) return false;
    return date.getDate() === proposedDate.getDate() &&
           date.getMonth() === proposedDate.getMonth() &&
           date.getFullYear() === proposedDate.getFullYear();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 5 || day === 6; // Friday or Saturday (Middle East weekend)
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (selectedPanelMembers.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        border: '1px dashed var(--border-medium)',
      }}>
        <span style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>📅</span>
        <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          Select panel members to view their availability calendar
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
      }}>
        <button
          onClick={previousMonth}
          className="btn-sm btn-secondary"
          style={{ cursor: 'pointer' }}
        >
          ← Previous
        </button>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {monthName}
        </h3>
        <button
          onClick={nextMonth}
          className="btn-sm btn-secondary"
          style={{ cursor: 'pointer' }}
        >
          Next →
        </button>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--error-light)', borderRadius: '0.25rem' }} />
          <span style={{ color: 'var(--text-secondary)' }}>On Leave</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--warning-light)', borderRadius: '0.25rem' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Interview Scheduled</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--success-light)', borderRadius: '0.25rem', border: '2px solid var(--success)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Proposed Date</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--border-medium)', borderRadius: '0.25rem' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Weekend</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading availability...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedPanelMembers.map(memberId => {
            const isExpanded = expandedMember === memberId;
            const memberName = getMemberName(memberId);

            return (
              <div
                key={memberId}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                {/* Member Header */}
                <button
                  onClick={() => setExpandedMember(isExpanded ? null : memberId)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {memberName}
                  </span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-tertiary)' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {/* Calendar Grid */}
                {isExpanded && (
                  <div style={{ padding: '1rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.25rem',
                    }}>
                      {/* Day headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div
                          key={day}
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {day}
                        </div>
                      ))}

                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: days[0].getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}

                      {/* Calendar days */}
                      {days.map((day) => {
                        const busyPeriods = getBusyPeriodsForDay(memberId, day);
                        const hasLeave = busyPeriods.some(p => p.type === 'leave');
                        const hasInterview = busyPeriods.some(p => p.type === 'interview');
                        const isWeekendDay = isWeekend(day);
                        const isTodayDay = isToday(day);
                        const isProposed = isProposedDate(day);

                        let backgroundColor = 'var(--bg-primary)';
                        let borderColor = 'var(--border-light)';

                        if (isWeekendDay) {
                          backgroundColor = 'var(--border-medium)';
                        } else if (hasLeave) {
                          backgroundColor = 'var(--error-light)';
                          borderColor = 'var(--error)';
                        } else if (hasInterview) {
                          backgroundColor = 'var(--warning-light)';
                          borderColor = 'var(--warning)';
                        }

                        if (isProposed) {
                          borderColor = 'var(--success)';
                          if (!hasLeave && !hasInterview) {
                            backgroundColor = 'var(--success-light)';
                          }
                        }

                        return (
                          <div
                            key={day.toISOString()}
                            title={busyPeriods.map(p =>
                              p.type === 'leave' ? p.reason : p.title
                            ).join(', ')}
                            style={{
                              minHeight: '3rem',
                              padding: '0.5rem',
                              backgroundColor,
                              border: `2px solid ${borderColor}`,
                              borderRadius: '0.375rem',
                              cursor: busyPeriods.length > 0 ? 'help' : 'default',
                              position: 'relative',
                              transition: 'transform 0.1s',
                            }}
                            onMouseEnter={(e) => {
                              if (busyPeriods.length > 0) {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: isTodayDay ? 700 : 500,
                              color: isTodayDay ? 'var(--recruitment)' : 'var(--text-primary)',
                              marginBottom: '0.25rem',
                            }}>
                              {day.getDate()}
                            </div>

                            {busyPeriods.length > 0 && (
                              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>
                                {busyPeriods.map((period, i) => (
                                  <div key={i} style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}>
                                    {period.type === 'leave' ? '🏖️' : '📅'}
                                    {period.type === 'leave' ? period.reason : 'Interview'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
