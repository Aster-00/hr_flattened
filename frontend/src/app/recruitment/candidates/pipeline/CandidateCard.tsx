"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ApplicationWithDetails } from '../../types';
import { recruitmentApi } from '../../services';
import EmployeeSelectionModal from './EmployeeSelectionModal';
import CreateOfferModal from '../../components/CreateOfferModal';

interface CandidateCardProps {
  application: ApplicationWithDetails;
  onClick: () => void;
  isReferral?: boolean;
  onReferralMarked?: () => void;
}

export default function CandidateCard({ application, onClick, isReferral: initialIsReferral = false, onReferralMarked }: CandidateCardProps) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isReferral, setIsReferral] = useState(initialIsReferral);
  const [markingReferral, setMarkingReferral] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [currentStage, setCurrentStage] = useState(application.currentStage || 'screening');

  // Application stage options
  const applicationStages = [
    { value: 'screening', label: 'Screening' },
    { value: 'department_interview', label: 'Department Interview' },
    { value: 'hr_interview', label: 'HR Interview' },
    { value: 'offer', label: 'Offer' },
  ];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const candidateEmail = application.candidateId?.personalEmail;

    // Determine if we have an email
    const hasValidEmail = candidateEmail && candidateEmail.trim() !== '';

    // Different confirmation messages based on email availability
    const confirmMessage = hasValidEmail
      ? `Are you sure you want to reject ${candidateName} and send a rejection email to ${candidateEmail}?`
      : `Are you sure you want to reject ${candidateName}?\n\nNote: No rejection email will be sent because the candidate doesn't have an email address on file.`;

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) return;

    setSendingEmail(true);
    setEmailStatus('idle');

    try {
      // Update application status to rejected
      await recruitmentApi.updateApplicationStatus(
        application._id,
        'rejected',
        'Candidate rejected'
      );

      // If email exists, try to send rejection email
      if (hasValidEmail) {
        try {
          await recruitmentApi.sendRejectionEmail(
            candidateEmail,
            candidateName,
            jobTitle
          );
          setEmailStatus('success');
          alert(`${candidateName} has been rejected and a rejection email has been sent.`);
        } catch (emailError: any) {
          console.error('Failed to send rejection email:', emailError);
          const errorMessage = emailError?.text || emailError?.message || 'Unknown error occurred';
          // Status was updated successfully, but email failed
          setEmailStatus('error');
          alert(`${candidateName} has been rejected, but the rejection email failed to send:\n${errorMessage}\n\nThe application status has been updated to rejected.`);
        }
      } else {
        // No email to send, but status updated successfully
        setEmailStatus('success');
        alert(`${candidateName} has been rejected.\n\nNo email was sent because the candidate doesn't have an email address on file.`);
      }

      // Refresh the applications list to reflect the status change
      if (onReferralMarked) {
        onReferralMarked();
      }

      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Failed to reject candidate:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to reject candidate: ${errorMessage}`);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStage = e.target.value;
    const oldStage = currentStage;

    if (newStage === oldStage) return;

    setUpdatingStage(true);
    setCurrentStage(newStage);

    try {
      await recruitmentApi.updateApplicationStage(
        application._id,
        newStage,
        `Stage changed from ${oldStage} to ${newStage}`
      );

      // Refresh the applications list to reflect the stage change
      if (onReferralMarked) {
        onReferralMarked();
      }
    } catch (error: any) {
      console.error('Failed to update application stage:', error);
      setCurrentStage(oldStage); // Revert on error
      alert(`Failed to update stage: ${error?.message || 'Unknown error'}`);
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleMarkAsReferral = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isReferral) {
      alert('This candidate is already marked as a referral.');
      return;
    }

    // Get role from job template via requisition
    const role = jobTitle;
    if (!role || role === 'Unknown Position') {
      alert('Unable to determine job position. Please ensure the application has a valid job requisition with a template.');
      return;
    }

    const level = prompt('Enter the level (e.g., Junior, Mid, Senior):');
    if (!level || level.trim() === '') return;

    setSelectedLevel(level.trim());
    setShowEmployeeModal(true);
  };

  const handleEmployeeSelected = async (employeeId: string, employeeName: string) => {
    const role = jobTitle;

    if (!selectedLevel) {
      alert('Level information is missing. Please try again.');
      return;
    }

    setMarkingReferral(true);

    try {
      await recruitmentApi.tagCandidateAsReferral(application.candidateId._id, {
        referringEmployeeId: employeeId,
        role: role,
        level: selectedLevel,
      });

      setIsReferral(true);

      // Notify parent component if callback is provided
      if (onReferralMarked) {
        onReferralMarked();
      }

      alert(`${candidateName} has been successfully marked as a referral by ${employeeName} for ${role}!`);
    } catch (error: any) {
      console.error('Failed to mark candidate as referral:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to mark as referral: ${errorMessage}`);
    } finally {
      setMarkingReferral(false);
      setSelectedLevel(null);
    }
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'var(--info)';
      case 'in_process':
        return 'var(--warning)';
      case 'offer':
        return 'var(--success)';
      case 'hired':
        return 'var(--success)';
      case 'rejected':
        return 'var(--error)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get candidate name
  const candidateName = application.candidateId?.fullName ||
    `${application.candidateId?.firstName || ''} ${application.candidateId?.lastName || ''}`.trim() ||
    'Unknown Candidate';

  // Get job title
  const jobTitle = application.requisitionId?.templateId?.title || 'Unknown Position';

  // Check if email is available for rejection email
  const hasEmail = !!application.candidateId?.personalEmail && application.candidateId.personalEmail.trim() !== '';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-color)',
        padding: '1rem',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease',
      }}
      {...attributes}
      {...listeners}
    >
      {/* Candidate Name */}
      <h4
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--recruitment)';
          e.currentTarget.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.textDecoration = 'none';
        }}
      >
        {candidateName}
      </h4>

      {/* Candidate Number */}
      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        ID: {application.candidateId?.candidateNumber || 'N/A'}
      </p>

      {/* Job Title */}
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {jobTitle}
      </p>

      {/* Status Badge */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            backgroundColor: getStatusColor(application.status),
            color: 'white',
            borderRadius: '0.25rem',
            fontSize: '0.625rem',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {application.status.replace('_', ' ')}
        </span>
        {isReferral && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#9333ea',
              color: 'white',
              borderRadius: '0.25rem',
              fontSize: '0.625rem',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
            title="This candidate was referred by an employee"
          >
            ⭐ Referral
          </span>
        )}
      </div>

      {/* Application Stage Dropdown */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Application Stage:
        </label>
        <select
          value={currentStage}
          onChange={handleStageChange}
          onClick={(e) => e.stopPropagation()}
          disabled={updatingStage}
          style={{
            width: '100%',
            padding: '0.375rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: '0.25rem',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: updatingStage ? 'not-allowed' : 'pointer',
            opacity: updatingStage ? 0.6 : 1,
          }}
        >
          {applicationStages.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>

      {/* Additional Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Applied:</span>
          <span style={{ fontWeight: '500' }}>{formatDate(application.applicationDate || application.createdAt)}</span>
        </div>
        {application.assignedHr && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>HR:</span>
            <span style={{ fontWeight: '500' }}>
              {application.assignedHr.firstName} {application.assignedHr.lastName}
            </span>
          </div>
        )}
        {application.requisitionId?.location && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Location:</span>
            <span style={{ fontWeight: '500' }}>{application.requisitionId.location}</span>
          </div>
        )}
      </div>

      {/* Contact Info */}
      {application.candidateId?.personalEmail && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.625rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
            <span>📧</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {application.candidateId.personalEmail}
            </span>
          </div>
          {application.candidateId?.mobilePhone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>📱</span>
              <span>{application.candidateId.mobilePhone}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Create Offer Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOfferModal(true);
          }}
          title="Create a job offer for this candidate"
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: 'var(--success)',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Create Offer
        </button>

        {/* Mark as Referral Button */}
        <button
          onClick={handleMarkAsReferral}
          disabled={markingReferral || isReferral}
          title={isReferral ? 'This candidate is already marked as a referral' : 'Mark this candidate as a referral'}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: (markingReferral || isReferral) ? 'var(--text-secondary)' : '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: (markingReferral || isReferral) ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s ease',
            opacity: (markingReferral || isReferral) ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!markingReferral && !isReferral) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            if (!markingReferral && !isReferral) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {markingReferral ? 'Marking...' : isReferral ? '✓ Marked as Referral' : '⭐ Mark as Referral'}
        </button>

        {/* Reject Button */}
        <button
          onClick={handleReject}
          disabled={sendingEmail}
          title={!hasEmail ? 'Reject candidate (no email will be sent - email address not available)' : 'Reject candidate and send rejection email'}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: sendingEmail ? 'var(--text-secondary)' : 'var(--error)',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: sendingEmail ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s ease',
            opacity: sendingEmail ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!sendingEmail) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            if (!sendingEmail) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {sendingEmail ? 'Rejecting...' : hasEmail ? 'Reject Candidate' : 'Reject Candidate (No Email)'}
        </button>

        {/* Email Status Message */}
        {emailStatus !== 'idle' && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.375rem',
              backgroundColor: emailStatus === 'success' ? '#d1fae5' : '#fee2e2',
              color: emailStatus === 'success' ? '#065f46' : '#991b1b',
              borderRadius: '0.25rem',
              fontSize: '0.625rem',
              textAlign: 'center',
              fontWeight: '500',
            }}
          >
            {emailStatus === 'success' ? '✓ Email sent successfully!' : '✗ Failed to send email'}
          </div>
        )}
      </div>

      {/* Employee Selection Modal */}
      <EmployeeSelectionModal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedLevel(null);
        }}
        onSelect={handleEmployeeSelected}
        title="Select Referring Employee"
      />

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        application={application}
        onOfferCreated={() => {
          if (onReferralMarked) {
            onReferralMarked();
          }
        }}
      />
    </div>
  );
}
