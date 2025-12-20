"use client";

import React, { useEffect, useState } from "react";

interface ChangeRequest {
  _id: string;
  requestNumber: string;
  requestedByEmployeeId: string;
  requestType: string;
  targetDepartmentId?: string;
  targetPositionId?: string;
  details: string;
  reason: string;
  status: string;
  submittedByEmployeeId: string;
  submittedAt: string;
}

const STATUS_OPTIONS: string[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELED",
  "IMPLEMENTED",
];

export default function ReviewChangeRequestPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [statusSelection, setStatusSelection] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/organization-structure/change-request",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: ChangeRequest[] = await response.json();
        setRequests(data);
        const initialStatus: Record<string, string> = {};
        data.forEach((req) => {
          initialStatus[req._id] = req.status;
        });
        setStatusSelection(initialStatus);
      } else {
        const error = await response.text();
        setMessage(`Error loading requests: ${error}`);
      }
    } catch (error) {
      setMessage("Network error while loading requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    setStatusSelection((prev) => ({ ...prev, [id]: status }));
  };

  const handleReview = async (id: string) => {
    const selectedStatus = statusSelection[id];
    if (!selectedStatus) {
      setMessage("Please select a status before submitting.");
      return;
    }

    setSavingId(id);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No authentication token found. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/organization-structure/change-request/${id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      if (response.ok) {
        setMessage(`Request ${id} updated to ${selectedStatus}.`);
        // Update local list
        setRequests((prev) =>
          prev.map((req) =>
            req._id === id ? { ...req, status: selectedStatus } : req
          )
        );
      } else {
        const error = await response.text();
        setMessage(`Error updating request: ${error}`);
      }
    } catch (error) {
      setMessage("Network error while submitting review.");
    } finally {
      setSavingId(null);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, any> = {
      APPROVED: { bg: 'var(--success-light)', color: 'var(--success-dark)' },
      REJECTED: { bg: 'var(--error-light)', color: 'var(--error-dark)' },
      UNDER_REVIEW: { bg: 'var(--warning-light)', color: 'var(--warning-dark)' },
      SUBMITTED: { bg: 'var(--info-light)', color: 'var(--info-dark)' },
      DRAFT: { bg: 'var(--gray-100)', color: 'var(--gray-700)' },
      CANCELED: { bg: 'var(--gray-200)', color: 'var(--gray-600)' },
      IMPLEMENTED: { bg: 'var(--success-light)', color: 'var(--success-dark)' },
    };
    return styles[status] || { bg: 'var(--gray-100)', color: 'var(--gray-700)' };
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Review Change Requests
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Review and approve or reject change requests
        </p>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: message.includes('Error') ? 'var(--error-light)' : 'var(--success-light)',
          color: message.includes('Error') ? 'var(--error-dark)' : 'var(--success-dark)',
          borderLeft: `4px solid ${message.includes('Error') ? 'var(--error)' : 'var(--success)'}`,
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          Loading requests...
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
        }}>
          <table className="table" style={{
            width: '100%',
            backgroundColor: 'var(--bg-primary)',
            borderCollapse: 'collapse',
            minWidth: '800px',
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--border-medium)' }}>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Req #</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requested By</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Status</th>
                <th style={{ color: 'var(--text-secondary)', fontWeight: '600', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const badgeStyle = getStatusBadgeStyle(req.status);
                return (
                  <tr key={req._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {req.requestNumber}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {req.requestType}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {req.requestedByEmployeeId}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '200px', wordWrap: 'break-word' }}>
                      {req.details}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '200px', wordWrap: 'break-word' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        style={{
                          padding: '0.5rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                        value={statusSelection[req._id] || req.status}
                        onChange={(e) =>
                          handleStatusChange(req._id, e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleReview(req._id)}
                        disabled={savingId === req._id}
                        style={{
                          backgroundColor: 'var(--org-structure)',
                          color: 'var(--text-inverse)',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          cursor: savingId === req._id ? 'not-allowed' : 'pointer',
                          opacity: savingId === req._id ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (savingId !== req._id) {
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          }
                        }}
                      >
                        {savingId === req._id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td
                    style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}
                    colSpan={8}
                  >
                    No change requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
