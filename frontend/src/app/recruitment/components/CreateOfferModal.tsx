"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../services';
import { ApplicationWithDetails, OfferFormData, Employee, Offer } from '../types';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationWithDetails;
  onOfferCreated?: () => void;
}

export default function CreateOfferModal({
  isOpen,
  onClose,
  application,
  onOfferCreated
}: CreateOfferModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvers, setApprovers] = useState<Employee[]>([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [existingOffer, setExistingOffer] = useState<Offer | null>(null);
  const [checkingOffer, setCheckingOffer] = useState(false);

  // Form state
  const [grossSalary, setGrossSalary] = useState<string>('');
  const [signingBonus, setSigningBonus] = useState<string>('');
  const [benefits, setBenefits] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [insurances, setInsurances] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

  // Get candidate and job details
  const candidateName = application.candidateId?.fullName ||
    `${application.candidateId?.firstName || ''} ${application.candidateId?.lastName || ''}`.trim() ||
    'Unknown Candidate';
  const jobTitle = application.requisitionId?.templateId?.title || 'Unknown Position';
  const department = application.requisitionId?.templateId?.department || 'Unknown Department';

  useEffect(() => {
    if (isOpen) {
      loadApprovers();
      checkForExistingOffer();
    }
  }, [isOpen]);

  const checkForExistingOffer = async () => {
    try {
      setCheckingOffer(true);
      console.log('Checking for existing offers for application:', application._id);
      const offers = await recruitmentApi.getOffersByApplicationId(application._id);
      console.log('Existing offers found:', offers);
      if (offers && offers.length > 0) {
        const offer = offers[0];
        console.log('Setting existing offer:', offer);
        setExistingOffer(offer);
        // Pre-fill form with existing offer data
        setGrossSalary(offer.grossSalary.toString());
        setSigningBonus(offer.signingBonus?.toString() || '');
        setBenefits(offer.benefits?.join(', ') || '');
        setConditions(offer.conditions || '');
        setInsurances(offer.insurances || '');
        setContent(offer.content);
        setDeadline(offer.deadline ? new Date(offer.deadline).toISOString().split('T')[0] : '');
        setSelectedApprovers(offer.approvers?.map(a => a.employeeId) || []);
      } else {
        console.log('No existing offers found, creating new');
        setExistingOffer(null);
        // Pre-fill content with basic offer letter for new offers
        setContent(generateDefaultOfferContent());
      }
    } catch (err: any) {
      console.error('Error checking for existing offer:', err);
      // If error, assume no offer exists and continue
      setExistingOffer(null);
      setContent(generateDefaultOfferContent());
    } finally {
      setCheckingOffer(false);
    }
  };

  const loadApprovers = async () => {
    try {
      setLoadingApprovers(true);
      const [hrManagers, departmentManagers] = await Promise.all([
        recruitmentApi.getEmployeesByRole('HR Manager'),
        recruitmentApi.getEmployeesByRole('Department Manager')
      ]);
      setApprovers([...hrManagers, ...departmentManagers]);
    } catch (err: any) {
      console.error('Error loading approvers:', err);
      setError('Failed to load approvers. Some features may be limited.');
    } finally {
      setLoadingApprovers(false);
    }
  };

  const generateDefaultOfferContent = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Dear ${candidateName},

We are pleased to offer you the position of ${jobTitle} in the ${department} department.

This offer is contingent upon:
- Successful completion of background checks
- Verification of employment eligibility
- Reference checks

We look forward to welcoming you to our team.

Sincerely,
HR Department

Date: ${today}`;
  };

  const handleToggleApprover = (employeeId: string) => {
    setSelectedApprovers(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If viewing existing offer, just close the modal
    if (existingOffer) {
      onClose();
      return;
    }

    // Validation
    if (!grossSalary || parseFloat(grossSalary) <= 0) {
      setError('Please enter a valid gross salary');
      return;
    }

    if (!content.trim()) {
      setError('Please enter the offer letter content');
      return;
    }

    if (!deadline) {
      setError('Please set a response deadline');
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      setError('Deadline must be in the future');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse benefits from comma-separated string
      const benefitsList = benefits
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const offerData: OfferFormData = {
        applicationId: application._id,
        candidateId: application.candidateId._id,
        role: jobTitle,
        grossSalary: parseFloat(grossSalary),
        signingBonus: signingBonus ? parseFloat(signingBonus) : undefined,
        benefits: benefitsList.length > 0 ? benefitsList : undefined,
        conditions: conditions.trim() || undefined,
        insurances: insurances.trim() || undefined,
        content: content.trim(),
        deadline: new Date(deadline).toISOString(),
        approvers: selectedApprovers.length > 0
          ? selectedApprovers.map(id => {
              const approver = approvers.find(a => a._id === id);
              return {
                employeeId: id,
                role: approver?.systemRole?.[0] || 'Approver'
              };
            })
          : undefined
      };

      const createdOffer = await recruitmentApi.createOffer(offerData);

      // If no approvers were selected, the offer is immediately approved - send email
      if (selectedApprovers.length === 0 && createdOffer && createdOffer._id) {
        console.log('Offer created without approvers, sending email to candidate...');
        const emailResult = await recruitmentApi.sendOfferLetterEmailByOfferId(createdOffer._id);
        if (emailResult.success) {
          console.log('Offer letter email sent successfully');
          alert(`Offer created successfully for ${candidateName}! Email sent to candidate.`);
        } else {
          console.warn('Failed to send offer letter email:', emailResult.message);
          alert(`Offer created successfully for ${candidateName}! However, the email could not be sent automatically.`);
        }
      } else {
        alert(`Offer created successfully for ${candidateName}!${selectedApprovers.length > 0 ? ' Approval workflow has been initiated.' : ''}`);
      }

      // Reset form
      resetForm();

      if (onOfferCreated) {
        await onOfferCreated();
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to create offer:', err);
      const errorMessage = err.message || 'Failed to create offer';

      // If error is about existing offer, refresh the modal to show existing offer
      if (errorMessage.toLowerCase().includes('offer already exists')) {
        setError('An offer already exists for this application. Loading existing offer...');
        // Re-check for existing offer
        await checkForExistingOffer();
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGrossSalary('');
    setSigningBonus('');
    setBenefits('');
    setConditions('');
    setInsurances('');
    setContent('');
    setDeadline('');
    setSelectedApprovers([]);
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div
      style={{
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
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '0.75rem',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
              }}
            >
              {existingOffer ? 'View Job Offer' : 'Create Job Offer'}
            </h2>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              {candidateName} - {jobTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem' }}>
            {existingOffer && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #93c5fd',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Existing Offer</div>
                An offer has already been created for this application. You are viewing the offer details in read-only mode.
              </div>
            )}

            {error && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #fca5a5',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Error</div>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Compensation Section */}
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  Compensation Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Gross Salary */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Gross Salary (Annual) <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(e.target.value)}
                      placeholder="e.g., 75000"
                      min="0"
                      step="0.01"
                      required
                      disabled={loading || !!existingOffer}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  {/* Signing Bonus */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Signing Bonus (Optional)
                    </label>
                    <input
                      type="number"
                      value={signingBonus}
                      onChange={(e) => setSigningBonus(e.target.value)}
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      disabled={loading || !!existingOffer}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* Benefits */}
                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Benefits (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="e.g., Health Insurance, 401(k) Match, Paid Time Off"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Insurances */}
                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Insurance Coverage
                  </label>
                  <input
                    type="text"
                    value={insurances}
                    onChange={(e) => setInsurances(e.target.value)}
                    placeholder="e.g., Medical, Dental, Vision, Life Insurance"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  Terms & Conditions
                </h3>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Special Conditions
                  </label>
                  <textarea
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="e.g., 90-day probation period, non-compete agreement, relocation assistance"
                    rows={3}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Offer Letter Content */}
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  Offer Letter Content
                </h3>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Letter Content <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the full offer letter content..."
                    rows={10}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                {/* Response Deadline */}
                <div style={{ marginTop: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Response Deadline <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={minDate}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Approvers Section */}
              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Approval Workflow (Optional)
                </h3>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                  }}
                >
                  Select approvers who need to review this offer before it can be sent to the candidate
                </p>

                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {loadingApprovers ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Loading approvers...
                    </p>
                  ) : approvers.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      No approvers available
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {approvers.map((approver) => (
                        <label
                          key={approver._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedApprovers.includes(approver._id)}
                            onChange={() => handleToggleApprover(approver._id)}
                            disabled={loading || !!existingOffer}
                            style={{
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {approver.personalInfo?.firstName} {approver.personalInfo?.lastName}
                            </div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {approver.workEmail} • {approver.systemRole?.[0] || 'Approver'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    marginTop: '0.5rem',
                  }}
                >
                  {selectedApprovers.length} approver(s) selected
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: 'var(--recruitment)',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {existingOffer ? 'Close' : (loading ? 'Creating Offer...' : 'Create Offer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
