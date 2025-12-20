import React, { useState } from 'react';
import type { LeaveRequest } from '../../types';

interface TeamLeaveCalendarProps {
  requests: LeaveRequest[];
  onDateSelect?: (date: Date) => void;
  statusFilter?: string[];
}

// Status styling configuration
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        bg: '#FEF3C7',
        border: '#F59E0B',
        text: '#92400E',
        label: '⏳ Pending',
        icon: '⏳'
      };
    case 'approved':
    case 'finalized':
      return {
        bg: '#D1FAE5',
        border: '#10B981',
        text: '#065F46',
        label: '✅ Approved',
        icon: '✅'
      };
    case 'rejected':
      return {
        bg: '#FEE2E2',
        border: '#EF4444',
        text: '#991B1B',
        label: '❌ Rejected',
        icon: '❌'
      };
    default:
      return {
        bg: '#DBEAFE',
        border: '#3B82F6',
        text: '#1E40AF',
        label: status,
        icon: '•'
      };
  }
};

export const TeamLeaveCalendar: React.FC<TeamLeaveCalendarProps> = ({
  requests,
  onDateSelect,
  statusFilter = ['pending', 'approved', 'finalized'],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getLeavesOnDate = (date: Date | null) => {
    if (!date) return [];
    return requests.filter((req) => {
      const start = new Date(req.dates.from);
      const end = new Date(req.dates.to);
      const isInDateRange = date >= start && date <= end;
      const matchesStatus = statusFilter.includes(req.status);
      return isInDateRange && matchesStatus;
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() &&
                         currentMonth.getFullYear() === new Date().getFullYear();

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-light)', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{monthName}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={previousMonth}
            style={{ padding: '6px 14px', border: '1px solid var(--border-light)', borderRadius: '6px', transition: 'all 0.2s', cursor: 'pointer', backgroundColor: 'white', fontWeight: '500' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            title="Previous month"
          >
            ←
          </button>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              style={{ padding: '6px 14px', border: '1px solid var(--leaves)', borderRadius: '6px', transition: 'all 0.2s', cursor: 'pointer', backgroundColor: 'white', color: 'var(--leaves)', fontWeight: '600', fontSize: '13px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--leaves)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'var(--leaves)';
              }}
              title="Go to current month"
            >
              Today
            </button>
          )}
          <button
            onClick={nextMonth}
            style={{ padding: '6px 14px', border: '1px solid var(--border-light)', borderRadius: '6px', transition: 'all 0.2s', cursor: 'pointer', backgroundColor: 'white', fontWeight: '500' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            title="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', padding: '8px 0' }}>
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((date, index) => {
          const leavesOnDate = getLeavesOnDate(date);
          const hasLeaves = leavesOnDate.length > 0;
          const hasPending = leavesOnDate.some(l => l.status === 'pending');
          const hasApproved = leavesOnDate.some(l => l.status === 'approved' || l.status === 'finalized');

          // Check if this is today
          const today = new Date();
          const isToday = date &&
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          // Determine cell border/background based on leave types
          let cellBorder = '1px solid var(--border-light)';
          let cellBg = date ? 'white' : 'var(--bg-secondary)';

          if (isToday && !hasLeaves) {
            cellBorder = '2px solid var(--leaves)';
            cellBg = '#F0F9FF';
          }

          if (hasLeaves) {
            if (hasPending && hasApproved) {
              cellBorder = '2px dashed #F59E0B'; // Mixed statuses - orange dashed
              cellBg = '#FFFBEB';
            } else if (hasPending) {
              cellBorder = '2px dotted #F59E0B'; // Pending - orange dotted
              cellBg = '#FEF3C7';
            } else if (hasApproved) {
              cellBorder = '2px solid #10B981'; // Approved - green solid
              cellBg = '#ECFDF5';
            }
          }

          return (
            <div
              key={index}
              onClick={() => date && onDateSelect?.(date)}
              style={{
                minHeight: '80px',
                padding: '8px',
                border: cellBorder,
                borderRadius: '8px',
                cursor: date ? 'pointer' : 'default',
                backgroundColor: cellBg,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => date && !hasLeaves && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
              onMouseLeave={(e) => date && !hasLeaves && (e.currentTarget.style.backgroundColor = 'white')}
            >
              {date && (
                <>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? 'var(--leaves)' : 'var(--text-primary)',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{date.getDate()}</span>
                    {isToday && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--leaves)',
                        display: 'inline-block'
                      }}></span>
                    )}
                  </div>
                  {hasLeaves && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {leavesOnDate.slice(0, 2).map((leave) => {
                        const statusStyle = getStatusStyle(leave.status);
                        return (
                          <div
                            key={leave._id}
                            style={{
                              fontSize: '11px',
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              border: `1px solid ${statusStyle.border}`,
                              fontWeight: '500'
                            }}
                            title={`${(leave.employeeId as any)?.firstName} ${(leave.employeeId as any)?.lastName} - ${statusStyle.label}`}
                          >
                            {statusStyle.icon} {(leave.employeeId as any)?.firstName}
                          </div>
                        );
                      })}
                      {leavesOnDate.length > 2 && (
                        <div style={{ fontSize: '11px', color: 'var(--gray-600)', fontWeight: '600' }}>+{leavesOnDate.length - 2} more</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced Legend */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Legend
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FEF3C7', border: '2px dotted #F59E0B', borderRadius: '4px' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>⏳ Pending Approval</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#ECFDF5', border: '2px solid #10B981', borderRadius: '4px' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>✅ Approved/Confirmed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFBEB', border: '2px dashed #F59E0B', borderRadius: '4px' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Mixed Statuses</span>
          </div>
        </div>
      </div>
    </div>
  );
};
