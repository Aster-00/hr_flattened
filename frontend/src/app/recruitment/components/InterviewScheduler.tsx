"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../services';
import { InterviewWithDetails } from '../types';
import { emailService } from '../services/email.service';
import PanelAvailabilityCalendar from './PanelAvailabilityCalendar';
import '../../../../main-theme.css';

interface InterviewSchedulerProps {
  applicationId: string;
  onScheduled?: () => void | Promise<void>;
}

interface PanelMember {
  _id: string;
  employeeNumber: string;
  firstName?: string;
  lastName?: string;
  workEmail?: string;
}

const stages = [
  { value: 'screening', label: 'Screening' },
  { value: 'department_interview', label: 'Department Interview' },
  { value: 'hr_interview', label: 'HR Interview' },
  { value: 'offer', label: 'Offer' }
];

const interviewMethods = [
  { value: 'onsite', label: 'In-Person' },
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' }
];

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border-light)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  marginTop: '0.25rem',
  color: 'var(--text-secondary)',
  margin: 0,
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '4rem 2rem',
  borderRadius: '0.75rem',
  border: '2px dashed var(--border-medium)',
  backgroundColor: 'var(--bg-secondary)',
};

const interviewsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const cardContentFlexStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1rem',
};

const itemsFlexStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '0.5rem',
};

const detailsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '1rem',
};

const detailBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--bg-secondary)',
};

const panelGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '0.5rem',
};

const panelMemberStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--bg-secondary)',
};

const avatarStyle: React.CSSProperties = {
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  background: 'linear-gradient(135deg, var(--recruitment) 0%, var(--primary-600) 100%)',
  color: 'var(--text-inverse)',
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  paddingTop: '1rem',
};

const videoLinkBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--info-light)',
  padding: '1.25rem',
  borderRadius: '0.75rem',
  border: '2px solid var(--info)',
};

const panelListStyle: React.CSSProperties = {
  border: '1px solid var(--border-medium)',
  borderRadius: '0.5rem',
  padding: '1rem',
  maxHeight: '16rem',
  overflowY: 'auto',
};

const panelItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.5rem',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const infoBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--info-light)',
};

export default function InterviewScheduler({ applicationId, onScheduled }: InterviewSchedulerProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledInterviews, setScheduledInterviews] = useState<InterviewWithDetails[]>([]);
  const [availablePanelMembers, setAvailablePanelMembers] = useState<PanelMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [stage, setStage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [method, setMethod] = useState('video');
  const [selectedPanelMembers, setSelectedPanelMembers] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState('');
  const [candidateFeedback, setCandidateFeedback] = useState('');

  useEffect(() => {
    loadInterviews();
    loadPanelMembers();
  }, [applicationId]);

  const loadInterviews = async () => {
    try {
      const interviews = await recruitmentApi.getInterviewsByApplication(applicationId);
      setScheduledInterviews(interviews);
    } catch (err: any) {
      console.error('Error loading interviews:', err);
    }
  };

  const loadPanelMembers = async () => {
    try {
      setLoading(true);
      const [hrEmployees, hrManagers] = await Promise.all([
        recruitmentApi.getEmployeesByRole('HR Employee'),
        recruitmentApi.getEmployeesByRole('HR Manager')
      ]);
      setAvailablePanelMembers([...hrEmployees, ...hrManagers]);
    } catch (err: any) {
      console.error('Error loading panel members:', err);
      setError('Failed to load panel members');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePanelMember = (memberId: string) => {
    setSelectedPanelMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stage || !scheduledDate || !scheduledTime || selectedPanelMembers.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    if (method === 'video' && !videoLink) {
      setError('Video link is required for video interviews');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
      const interviewDateTime = new Date(dateTimeString);

      const scheduleData = {
        applicationId,
        stage,
        scheduledDate: interviewDateTime.toISOString(),
        method,
        panel: selectedPanelMembers,
        videoLink: method === 'video' ? videoLink : undefined,
        candidateFeedback: candidateFeedback || undefined
      };

      await recruitmentApi.scheduleInterview(scheduleData);

      // Send email notification to the candidate
      try {
        const application = await recruitmentApi.getApplicationById(applicationId);
        const candidate = application?.candidateId;
        const jobTitle = application?.requisitionId?.templateId?.title || 'the position';
        
        if (candidate?.personalEmail) {
          const candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
          const methodLabel = method === 'video' ? 'Video Call' : method === 'phone' ? 'Phone Call' : 'In-Person';
          const stageLabel = stages.find(s => s.value === stage)?.label || stage;
          
          const formattedDateTime = interviewDateTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          const subject = `Interview Scheduled - ${jobTitle}`;
          let message = `Dear ${candidateName},

We are pleased to inform you that your ${stageLabel} interview for the ${jobTitle} position has been scheduled.

Interview Details:
- Date & Time: ${formattedDateTime}
- Interview Type: ${methodLabel}`;

          if (method === 'video' && videoLink) {
            message += `
- Video Link: ${videoLink}`;
          }

          message += `

Please make sure to be available at the scheduled time. If you have any questions or need to reschedule, please contact us.

Best regards,
HR Department`;

          await emailService.sendCustomEmail(candidate.personalEmail, subject, message);
          console.log('Interview notification email sent to candidate:', candidate.personalEmail);
        }
      } catch (emailError) {
        console.error('Failed to send interview notification email:', emailError);
        // Don't fail the whole operation if email fails
      }

      setStage('');
      setScheduledDate('');
      setScheduledTime('');
      setMethod('video');
      setSelectedPanelMembers([]);
      setVideoLink('');
      setCandidateFeedback('');
      setIsScheduling(false);

      await loadInterviews();

      if (onScheduled) {
        await onScheduled();
      }

      alert('Interview scheduled successfully! Notifications sent to panel members and candidate.');
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview');
      console.error('Error scheduling interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to cancel this interview? All participants will be notified.')) {
      return;
    }

    try {
      await recruitmentApi.cancelInterview(interviewId);
      await loadInterviews();
      alert('Interview cancelled successfully');
    } catch (err: any) {
      alert('Failed to cancel interview: ' + err.message);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'badge badge-info';
      case 'completed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  if (!isScheduling) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={titleStyle}>Interviews</h3>
            <p style={subtitleStyle}>Manage and schedule candidate interviews</p>
          </div>
          <button
            onClick={() => setIsScheduling(true)}
            className="btn-primary"
            style={{ backgroundColor: 'var(--recruitment)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1rem' }}>+</span>
            Schedule Interview
          </button>
        </div>

        {scheduledInterviews.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No interviews scheduled yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Click the button above to schedule your first interview</p>
          </div>
        ) : (
          <div style={interviewsListStyle}>
            {scheduledInterviews.map((interview) => (
              <div key={interview._id} className="card">
                <div style={cardContentFlexStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={itemsFlexStyle}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{interview.stage}</h4>
                      <span className={getStatusBadgeColor(interview.status)}>
                        {interview.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>📅</span>
                      <span style={{ fontWeight: 500 }}>{formatDateTime(interview.scheduledDate)}</span>
                    </div>
                  </div>
                </div>

                <div style={detailsGridStyle}>
                  <div style={detailBoxStyle}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {interview.method === 'video' ? '📹' : interview.method === 'phone' ? '📞' : '🏢'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', color: 'var(--text-tertiary)' }}>Method</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {interview.method === 'video' ? 'Video Call' : interview.method === 'phone' ? 'Phone Call' : 'In-Person'}
                      </div>
                    </div>
                  </div>

                  {interview.videoLink && (
                    <div style={infoBoxStyle}>
                      <span style={{ fontSize: '1rem' }}>🔗</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', color: 'var(--info-dark)' }}>Video Link</div>
                        <a
                          href={interview.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-link)', textDecoration: 'none', wordBreak: 'break-all' }}
                        >
                          {interview.videoLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1rem' }}>👥</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Panel Members ({interview.panel.length})</span>
                  </div>
                  <div style={panelGridStyle}>
                    {interview.panel.map((member) => (
                      <div key={member._id} style={panelMemberStyle}>
                        <div style={avatarStyle}>
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {member.firstName} {member.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.workEmail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {interview.candidateFeedback && (
                  <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>💬</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', color: 'var(--warning-dark)' }}>Additional Notes</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--warning-dark)', margin: 0 }}>{interview.candidateFeedback}</p>
                      </div>
                    </div>
                  </div>
                )}

                {interview.status === 'SCHEDULED' && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCancelInterview(interview._id)}
                      className="btn-danger"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                      ✕ Cancel Interview
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={titleStyle}>Schedule New Interview</h3>
          <p style={subtitleStyle}>Fill in the details to schedule an interview</p>
        </div>
        <button
          onClick={() => {
            setIsScheduling(false);
            setError(null);
          }}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          ✕ Cancel
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Interview Stage */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--recruitment)' }}>📋</span>
            Interview Stage <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="form-input"
            required
            style={{ cursor: 'pointer' }}
          >
            <option value="">Select a stage</option>
            {stages.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--recruitment)' }}>📅</span>
            <span className="form-label" style={{ marginBottom: 0 }}>Date & Time</span>
            <span style={{ color: 'var(--error)' }}>*</span>
          </div>
          <div style={formGridStyle}>
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Interview Method */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--recruitment)' }}>📹</span>
            Interview Method <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="form-input"
            required
            style={{ cursor: 'pointer' }}
          >
            {interviewMethods.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Video Link (conditional) */}
        {method === 'video' && (
          <div className="form-group" style={videoLinkBoxStyle}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--info)' }}>🔗</span>
              Video Link <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className="form-input"
              required={method === 'video'}
            />
          </div>
        )}

        {/* Panel Members Selection */}
        <div className="form-group">
          <label className="form-label">
            Panel Members <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <div style={panelListStyle}>
            {availablePanelMembers.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>Loading panel members...</p>
            ) : (
              availablePanelMembers.map((member) => {
                // Check if this member was in the most recent interview
                const mostRecentInterview = scheduledInterviews[0];
                const wasInPreviousInterview = mostRecentInterview?.panel?.some((panelMember: any) => panelMember._id === member._id);

                return (
                  <label
                    key={member._id}
                    style={panelItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPanelMembers.includes(member._id)}
                      onChange={() => handleTogglePanelMember(member._id)}
                      style={{ accentColor: 'var(--recruitment)', width: '1rem', height: '1rem' }}
                    />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {member.firstName} {member.lastName}
                          {wasInPreviousInterview && (
                            <span style={{
                              fontSize: '0.625rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              backgroundColor: 'var(--info-light)',
                              color: 'var(--info-dark)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Previously Selected
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {member.workEmail} • {member.employeeNumber}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-tertiary)' }}>
            {selectedPanelMembers.length} member(s) selected
          </p>
        </div>

        {/* Candidate Feedback/Notes */}
        <div className="form-group">
          <label className="form-label">
            Additional Notes for Candidate
          </label>
          <textarea
            value={candidateFeedback}
            onChange={(e) => setCandidateFeedback(e.target.value)}
            placeholder="Any additional information for the candidate..."
            rows={3}
            className="form-input"
          />
        </div>

        {/* Panel Availability Calendar */}
        {selectedPanelMembers.length > 0 && (
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--recruitment)' }}>📅</span>
              Panel Member Availability
            </label>
            <PanelAvailabilityCalendar
              selectedPanelMembers={selectedPanelMembers}
              availablePanelMembers={availablePanelMembers}
              proposedDate={scheduledDate && scheduledTime ? new Date(`${scheduledDate}T${scheduledTime}`) : undefined}
            />
          </div>
        )}

        {/* Submit Button */}
        <div style={buttonContainerStyle}>
          <button
            type="button"
            onClick={() => {
              setIsScheduling(false);
              setError(null);
            }}
            className="btn-secondary"
            disabled={loading}
            style={{ cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            style={{ backgroundColor: 'var(--recruitment)', cursor: 'pointer' }}
            disabled={loading || selectedPanelMembers.length === 0}
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </form>

      <div className="alert alert-info" style={{ marginTop: '1rem' }}>
        <h4 style={{ fontWeight: 500, margin: 0, marginBottom: '0.5rem', color: 'var(--info-dark)' }}>Auto-Notifications</h4>
        <ul style={{ fontSize: '0.875rem', color: 'var(--info-dark)', margin: 0, paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.25rem' }}>✓ Panel members will receive calendar invites</li>
          <li style={{ marginBottom: '0.25rem' }}>✓ System checks panel availability and leave status</li>
          <li style={{ marginBottom: '0.25rem' }}>✓ Detects scheduling conflicts automatically</li>
          <li style={{ marginBottom: '0.25rem' }}>✓ Candidate will be notified with interview details</li>
          <li>✓ Video link will be included in notifications (if applicable)</li>
        </ul>
      </div>
    </div>
  );
}
