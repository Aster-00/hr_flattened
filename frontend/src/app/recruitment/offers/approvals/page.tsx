"use client";

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Offer, ApproverRole, FINANCIAL_APPROVAL_THRESHOLDS } from '../../types';
import { recruitmentApi } from '../../services';

interface TokenPayload {
  id: string;
  sub?: string;
}

const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.id || decoded.sub || null;
  } catch {
    return null;
  }
};

export default function OffersApprovalsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    console.log('Current user ID from token:', userId);
    setCurrentUserId(userId);
    getAllOffers();
  }, []);

  // Check if current user is a pending approver for this offer
  const isCurrentUserPendingApprover = (offer: Offer): boolean => {
    if (!currentUserId) return false;
    const approver = offer.approvers.find((a) => {
      // employeeId can be a string OR a populated object with _id
      const empId = typeof a.employeeId === 'string'
        ? a.employeeId
        : (a.employeeId as any)?._id?.toString() || (a.employeeId as any)?.toString();
      return empId === currentUserId && a.status === 'pending';
    });
    console.log('Checking approvers for offer:', offer._id, 'approvers:', offer.approvers, 'currentUserId:', currentUserId, 'found:', approver);
    return !!approver;
  };

  const getAllOffers = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getAllOffers();
      setOffers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offerId: string, approverId: string) => {
    try {
      setApprovingId(offerId);
      const updatedOffer = await recruitmentApi.updateOfferApprovalStatus(offerId, {
        approverId,
        status: 'approved',
        comment: approvalComment,
      });

      // Check if the offer is now fully approved and send email
      if (updatedOffer && updatedOffer.finalStatus === 'approved') {
        console.log('Offer fully approved, sending email to candidate...');
        const emailResult = await recruitmentApi.sendOfferLetterEmailByOfferId(offerId);
        if (emailResult.success) {
          console.log('Offer letter email sent successfully');
        } else {
          console.warn('Failed to send offer letter email:', emailResult.message);
          // Don't fail the approval, just warn
        }
      }

      await getAllOffers();
      setShowApprovalModal(false);
      setSelectedOffer(null);
      setApprovalComment('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve offer');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (offerId: string, approverId: string) => {
    try {
      setApprovingId(offerId);
      await recruitmentApi.updateOfferApprovalStatus(offerId, {
        approverId,
        status: 'rejected',
        comment: approvalComment,
      });
      await getAllOffers();
      setShowApprovalModal(false);
      setSelectedOffer(null);
      setApprovalComment('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject offer');
    } finally {
      setApprovingId(null);
    }
  };

  const openApprovalModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowApprovalModal(true);
    setApprovalComment('');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      case 'pending':
        return 'badge-pending';
      default:
        return 'badge-info';
    }
  };

  // REC-027: Check if offer requires financial approval based on salary
  const requiresFinanceApproval = (salary: number): boolean => {
    return salary > FINANCIAL_APPROVAL_THRESHOLDS.STANDARD_MAX;
  };

  // REC-027: Check if offer requires department head approval
  const requiresDepartmentHeadApproval = (salary: number): boolean => {
    return salary > FINANCIAL_APPROVAL_THRESHOLDS.SENIOR_MAX;
  };

  // REC-027: Get the approval level description based on salary
  const getApprovalLevelDescription = (salary: number): string => {
    if (salary > FINANCIAL_APPROVAL_THRESHOLDS.SENIOR_MAX) {
      return 'Executive Level - Requires Finance + Department Head Approval';
    } else if (salary > FINANCIAL_APPROVAL_THRESHOLDS.STANDARD_MAX) {
      return 'Senior Level - Requires Finance Approval';
    }
    return 'Standard Level';
  };

  // Get approver status icon
  const getApproverStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      case 'pending':
        return '○';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-secondary">Loading offers pending approval...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary module-recruitment">Offers Pending Approval</h1>
        <p className="text-secondary mt-2">Review and approve or reject job offers</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="card text-center">
          <p className="text-secondary">No offers pending your approval at the moment.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Gross Salary</th>
                <th>Approval Level</th>
                <th>Approvers</th>
                <th>Approval Status</th>
                <th>Applicant Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer._id}>
                  <td>
                    <div className="text-primary font-medium">
                      {!offer.candidateId ? 'Unknown Candidate' :
                        typeof offer.candidateId === 'string' ? offer.candidateId :
                        `${(offer.candidateId as any)?.firstName || ''} ${(offer.candidateId as any)?.lastName || ''}`.trim() || 'Unknown Candidate'}
                    </div>
                  </td>
                  <td>{offer.role}</td>
                  <td>${offer.grossSalary.toLocaleString()}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs ${requiresFinanceApproval(offer.grossSalary) ? 'text-warning font-medium' : 'text-secondary'}`}>
                        {getApprovalLevelDescription(offer.grossSalary)}
                      </span>
                      {requiresFinanceApproval(offer.grossSalary) && (
                        <span className="badge badge-warning text-xs">Finance Required</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {offer.approvers.map((approver, idx) => (
                        <span
                          key={idx}
                          className={`badge text-xs ${getStatusBadgeClass(approver.status)}`}
                          title={`${approver.role}: ${approver.status}`}
                        >
                          {getApproverStatusIcon(approver.status)} {approver.role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(offer.finalStatus)}`}>
                      {offer.finalStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(offer.applicantResponse || 'pending')}`}>
                      {offer.applicantResponse || 'pending'}
                    </span>
                    {offer.candidateSignedAt && (
                      <div className="text-xs text-secondary mt-1">
                        Signed: {new Date(offer.candidateSignedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openApprovalModal(offer)}
                      className="text-link hover:text-link-hover font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApprovalModal && selectedOffer && (
        <div className="modal-overlay fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="modal-content relative mx-auto w-full max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-primary">
                Review Offer
              </h3>
            </div>
            <div className="modal-body">

              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <p className="text-primary">{selectedOffer.role}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Gross Salary</label>
                  <p className="text-primary">${selectedOffer.grossSalary.toLocaleString()}</p>
                </div>

                {selectedOffer.signingBonus && (
                  <div className="form-group">
                    <label className="form-label">Signing Bonus</label>
                    <p className="text-primary">${selectedOffer.signingBonus.toLocaleString()}</p>
                  </div>
                )}

                {selectedOffer.benefits && selectedOffer.benefits.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Benefits</label>
                    <ul className="mt-1 list-disc list-inside text-primary">
                      {selectedOffer.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOffer.conditions && (
                  <div className="form-group">
                    <label className="form-label">Conditions</label>
                    <p className="text-primary">{selectedOffer.conditions}</p>
                  </div>
                )}

                {selectedOffer.insurances && (
                  <div className="form-group">
                    <label className="form-label">Insurances</label>
                    <p className="text-primary">{selectedOffer.insurances}</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Content</label>
                  <p className="text-primary whitespace-pre-wrap">{selectedOffer.content}</p>
                </div>

                {/* REC-027: Approval Workflow Timeline */}
                <div className="form-group">
                  <label className="form-label"></label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    {/* Approval Level Indicator */}
                    <div className="mb-4 p-3 rounded" style={{
                      backgroundColor: requiresFinanceApproval(selectedOffer.grossSalary) ? '#fef3cd' : '#d4edda'
                    }}>
                      <span className="font-medium">
                        {getApprovalLevelDescription(selectedOffer.grossSalary)}
                      </span>
                      {requiresFinanceApproval(selectedOffer.grossSalary) && (
                        <p className="text-sm mt-1 text-gray-600">
                          Financial approval is required for offers exceeding ${FINANCIAL_APPROVAL_THRESHOLDS.STANDARD_MAX.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Approvers Timeline */}
                    <div className="space-y-3">
                      {selectedOffer.approvers.map((approver, idx) => {
                        const isFinanceApprover = approver.role === ApproverRole.FINANCE;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded border ${
                              approver.status === 'approved' ? 'bg-green-50 border-green-200' :
                              approver.status === 'rejected' ? 'bg-red-50 border-red-200' :
                              'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              approver.status === 'approved' ? 'bg-green-500 text-white' :
                              approver.status === 'rejected' ? 'bg-red-500 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {getApproverStatusIcon(approver.status)}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{approver.role}</span>
                                {isFinanceApprover && (
                                  <span className="badge badge-warning text-xs">Financial Approval</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Status: <span className={`font-medium ${
                                  approver.status === 'approved' ? 'text-green-600' :
                                  approver.status === 'rejected' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>{approver.status}</span>
                                {approver.actionDate && (
                                  <span className="ml-2">
                                    on {new Date(approver.actionDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {approver.comment && (
                                <p className="text-sm text-gray-600 mt-1 italic">
                                  &quot;{approver.comment}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overall Status */}
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Overall Status:</span>
                        <span className={`badge ${getStatusBadgeClass(selectedOffer.finalStatus)}`}>
                          {selectedOffer.finalStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comment" className="form-label">
                    Comment (Optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="form-input"
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedOffer(null);
                  setApprovalComment('');
                }}
                disabled={approvingId === selectedOffer._id}
                className="btn-secondary"
                style={{ opacity: approvingId === selectedOffer._id ? 0.5 : 1 }}
              >
                Cancel
              </button>

              {isCurrentUserPendingApprover(selectedOffer) ? (
                <>
                  <button
                    onClick={() => {
                      if (currentUserId) {
                        handleReject(selectedOffer._id, currentUserId);
                      }
                    }}
                    disabled={approvingId === selectedOffer._id}
                    className="btn-danger"
                    style={{ opacity: approvingId === selectedOffer._id ? 0.5 : 1 }}
                  >
                    {approvingId === selectedOffer._id ? 'Processing...' : 'Reject'}
                  </button>

                  <button
                    onClick={() => {
                      if (currentUserId) {
                        handleApprove(selectedOffer._id, currentUserId);
                      }
                    }}
                    disabled={approvingId === selectedOffer._id}
                    className="btn-success"
                    style={{ opacity: approvingId === selectedOffer._id ? 0.5 : 1 }}
                  >
                    {approvingId === selectedOffer._id ? 'Processing...' : 'Approve'}
                  </button>
                </>
              ) : (
                <span className="text-secondary text-sm">
                  You are not an approver for this offer
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

