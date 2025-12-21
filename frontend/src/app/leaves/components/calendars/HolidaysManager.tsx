// Holidays Manager component
'use client';

import React, { useState } from 'react';
import { showToast } from '@/app/lib/toast';
import { formatDate } from '../../utils/dates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Holiday {
  _id: string;
  date?: string;
  startDate?: string;
  name: string;
  description?: string;
}

interface HolidaysManagerProps {
  calendarId: string;
  holidays: Holiday[];
  onRefetch: () => void;
}

export default function HolidaysManager({ calendarId, holidays, onRefetch }: HolidaysManagerProps) {
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/leaves/calendars/${calendarId}/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newHoliday),
      });

      if (!response.ok) {
        throw new Error('Failed to add holiday');
      }

      showToast('Holiday added successfully', 'success');
      setNewHoliday({ date: '', name: '', description: '' });
      setIsAddingHoliday(false);
      onRefetch();
    } catch (error: any) {
      showToast(error.message || 'Failed to add holiday', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the holiday "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/leaves/calendars/${calendarId}/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete holiday');
      }

      showToast('Holiday deleted successfully', 'success');
      onRefetch();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete holiday', 'error');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginTop: '1rem'
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
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Holidays
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Manage public holidays that are excluded from working days
          </p>
        </div>
        {!isAddingHoliday && (
          <button
            onClick={() => setIsAddingHoliday(true)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            <span style={{ fontSize: '16px' }}>+</span>
            Add Holiday
          </button>
        )}
      </div>

      {/* Add Holiday Form */}
      {isAddingHoliday && (
        <div style={{
          padding: '24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '6px',
                  color: '#374151'
                }}>
                  Holiday Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  placeholder="e.g., New Year's Day"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '6px',
                color: '#374151'
              }}>
                Description (optional)
              </label>
              <input
                type="text"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                placeholder="Additional details"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Holiday'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingHoliday(false);
                  setNewHoliday({ date: '', name: '', description: '' });
                }}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Holidays List */}
      {holidays.length === 0 ? (
        <div style={{
          padding: '48px 24px',
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
            🗓️
          </div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#111827',
            marginBottom: '8px'
          }}>
            No holidays defined
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Add holidays to exclude them from working days calculations
          </p>
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
                  Date
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
                  Holiday Name
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
                  Description
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
              {holidays
                .sort((a, b) => {
                  const dateA = new Date(a.date || a.startDate || '').getTime();
                  const dateB = new Date(b.date || b.startDate || '').getTime();
                  return dateA - dateB;
                })
                .map((holiday) => (
                  <tr
                    key={holiday._id}
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
                          backgroundColor: '#dbeafe',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          🎉
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#111827'
                        }}>
                          {formatDate(holiday.date || holiday.startDate || '')}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px 24px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      {holiday.name}
                    </td>
                    <td style={{
                      padding: '16px 24px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {holiday.description || '-'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteHoliday(holiday._id, holiday.name)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#dc2626',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fecaca';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
