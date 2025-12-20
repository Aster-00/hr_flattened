"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../services';
import {
  ApplicationWithDetails,
  ApplicationHistory,
  InterviewWithDetails,
  InterviewFeedback
} from '../types';
import InterviewScheduler from './InterviewScheduler';

interface CandidateProfileProps {
  applicationId: string;
  onStageUpdate?: () => void | Promise<void>;
}

export default function CandidateProfile({ applicationId, onStageUpdate }: CandidateProfileProps) {
  const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'resume' | 'history' | 'interviews' | 'communication'>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [stageNotes, setStageNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCandidateData();
  }, [applicationId]);

  const loadCandidateData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch application and history data
      const [appData, historyData] = await Promise.all([
        recruitmentApi.getApplicationById(applicationId),
        recruitmentApi.getApplicationHistory(applicationId),
      ]);

      setApplication(appData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate data');
      console.error('Error loading candidate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = (newStage: string) => {
    setSelectedStage(newStage);
    setShowStageModal(true);
  };

  const handleUpdateStage = async () => {
    if (!selectedStage || !application) return;

    try {
      setUpdating(true);

      // REC-004: Update application status
      await recruitmentApi.updateApplicationStatus(
        applicationId,
        selectedStage,
        stageNotes
      );

      // Reload the application to get updated status
      const updatedApp = await recruitmentApi.getApplicationById(applicationId);
      setApplication(updatedApp);

      setShowStageModal(false);
      setStageNotes('');

      // Reload history to show the new change
      const historyData = await recruitmentApi.getApplicationHistory(applicationId);
      setHistory(historyData);

      // Call the parent's refresh callback to update the Kanban board
      if (onStageUpdate) {
        await onStageUpdate();
      }
    } catch (err: any) {
      alert('Failed to update application status: ' + (err.message || 'Unknown error'));
      console.error('Error updating application status:', err);
    } finally {
      setUpdating(false);
    }
  };

  // REC-004: Use ApplicationStatus values for status changes
  const availableStages = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_process', label: 'In Process' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const availableStatuses = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'in_process', label: 'In Process' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'SCREENING': '#3b82f6',
      'DEPARTMENT_INTERVIEW': '#8b5cf6',
      'HR_INTERVIEW': '#ec4899',
      'OFFER': '#10b981',
    };
    return colors[stage] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'SUBMITTED': '#3b82f6',
      'IN_PROCESS': '#f59e0b',
      'OFFER': '#10b981',
      'HIRED': '#059669',
      'REJECTED': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
          Loading candidate profile...
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '1rem' }}>
          {error || 'Application not found'}
        </div>
        <button
          onClick={loadCandidateData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--recruitment)',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const candidate = application.candidateId;
  const job = application.requisitionId;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '2rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Candidate ID: {candidate.candidateNumber}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Display Candidate Status (REC-004) */}
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: getStageColor(candidate.status || 'APPLIED'),
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                {candidate.status?.replace(/_/g, ' ') || 'APPLIED'}
              </div>
              {/* Application Status */}
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: getStatusColor(application.status),
                color: 'white',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                Application: {application.status}
              </div>
              {/* Stage Change Dropdown */}
              <select
                value=""
                onChange={(e) => handleStageChange(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--recruitment)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <option value="">Change Candidate Status...</option>
                {availableStages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Applied for
            </p>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {job.templateId.title}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {job.templateId.department} • {job.location}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Applied: {formatDate(application.applicationDate || application.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '2rem',
      }}>
        {[
          { id: 'info', label: 'Personal Information' },
          { id: 'resume', label: 'CV/Resume' },
          { id: 'history', label: 'Application History' },
          { id: 'interviews', label: 'Interviews & Feedback' },
          { id: 'communication', label: 'Communication Log' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? 'var(--recruitment)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--recruitment)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '2rem',
      }}>
        {activeTab === 'info' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Personal Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <InfoField label="Full Name" value={candidate.fullName || `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim()} />
              <InfoField label="First Name" value={candidate.firstName} />
              <InfoField label="Middle Name" value={candidate.middleName} />
              <InfoField label="Last Name" value={candidate.lastName} />
              <InfoField label="Personal Email" value={candidate.personalEmail} />
              <InfoField label="Mobile Phone" value={candidate.mobilePhone} />
              <InfoField label="Home Phone" value={candidate.homePhone} />
              <InfoField label="National ID" value={candidate.nationalId} />
              <InfoField label="Date of Birth" value={formatDate(candidate.dateOfBirth)} />
              <InfoField label="Gender" value={candidate.gender} />
              <InfoField label="Marital Status" value={candidate.maritalStatus} />
              <InfoField label="City" value={candidate.address?.city} />
              <InfoField label="Street Address" value={candidate.address?.streetAddress} />
              <InfoField label="Country" value={candidate.address?.country} />
              <InfoField label="Application Date" value={formatDate(candidate.applicationDate)} />
            </div>

            {candidate.notes && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Notes / Cover Letter
                </h3>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  whiteSpace: 'pre-wrap',
                }}>
                  {candidate.notes}
                </div>
              </div>
            )}

            {application.assignedHr && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  Assigned HR
                </h3>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                }}>
                  <p style={{ fontWeight: '600' }}>
                    {application.assignedHr.firstName} {application.assignedHr.lastName}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {application.assignedHr.workEmail}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    ID: {application.assignedHr.employeeNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              CV/Resume Viewer
            </h2>
            {candidate.resumeUrl ? (
              <div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${candidate.resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--recruitment)',
                    textDecoration: 'underline',
                    fontWeight: '500',
                  }}
                >
                  {`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${candidate.resumeUrl}`}
                </a>
              </div>
            ) : (
              <div style={{
                padding: '4rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}>
                No resume uploaded
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Application History
            </h2>
            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((item, index) => (
                  <div
                    key={item._id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid var(--recruitment)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        {item.oldStage && item.newStage && (
                          <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Stage Change: <span style={{ color: getStageColor(item.oldStage) }}>{item.oldStage}</span>
                            {' → '}
                            <span style={{ color: getStageColor(item.newStage) }}>{item.newStage}</span>
                          </p>
                        )}
                        {item.oldStatus && item.newStatus && (
                          <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Status Change: <span style={{ color: getStatusColor(item.oldStatus) }}>{item.oldStatus}</span>
                            {' → '}
                            <span style={{ color: getStatusColor(item.newStatus) }}>{item.newStatus}</span>
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {formatDateTime(item.changedAt)}
                        </p>
                        {item.changedBy && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            by {item.changedBy.firstName} {item.changedBy.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.notes && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        marginTop: '0.5rem',
                      }}>
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '4rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}>
                No history records found
              </div>
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <InterviewScheduler
              applicationId={applicationId}
              onScheduled={loadCandidateData}
            />
          </div>
        )}

        {activeTab === 'communication' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Communication Log
            </h2>
            <div style={{
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              Communication log will be populated from notification service logs
              <br />
              <small>(This feature integrates with the notification system)</small>
            </div>
          </div>
        )}
      </div>

      {/* Stage Change Modal */}
      {showStageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Change Candidate Status
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                New Status
              </label>
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--recruitment)',
              }}>
                {availableStages.find(s => s.value === selectedStage)?.label || selectedStage}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Notes (Optional)
              </label>
              <textarea
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowStageModal(false);
                  setStageNotes('');
                  setSelectedStage('');
                }}
                disabled={updating}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStage}
                disabled={updating}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--recruitment)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                }}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for displaying info fields
function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '1rem', fontWeight: '500' }}>
        {value || 'N/A'}
      </p>
    </div>
  );
}
