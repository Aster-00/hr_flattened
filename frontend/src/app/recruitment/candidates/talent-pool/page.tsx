"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../../services';
import { Candidate, ApplicationWithDetails } from '../../types';
import { CandidateStatus, CANDIDATE_STATUS_STAGES } from '../../enums/candidate-status.enum';
import { useRouter } from 'next/navigation';
import CandidateProfile from '../../components/CandidateProfile';

type SortField = 'fullName' | 'candidateNumber' | 'status' | 'applicationDate' | 'personalEmail';
type SortOrder = 'asc' | 'desc';

export default function TalentPoolPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('applicationDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruitmentApi.getAllCandidates();
      setCandidates(data);
      setFilteredCandidates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...candidates];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => {
        const fullName = candidate.fullName ||
          `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
        const candidateNumber = candidate.candidateNumber || '';
        const email = candidate.personalEmail || '';
        const mobilePhone = candidate.mobilePhone || '';

        return fullName.toLowerCase().includes(query) ||
          candidateNumber.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          mobilePhone.toLowerCase().includes(query);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'fullName':
          aValue = (a.fullName || `${a.firstName || ''} ${a.lastName || ''}`).toLowerCase();
          bValue = (b.fullName || `${b.firstName || ''} ${b.lastName || ''}`).toLowerCase();
          break;
        case 'candidateNumber':
          aValue = a.candidateNumber || '';
          bValue = b.candidateNumber || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'applicationDate':
          aValue = new Date(a.applicationDate || a.createdAt || 0).getTime();
          bValue = new Date(b.applicationDate || b.createdAt || 0).getTime();
          break;
        case 'personalEmail':
          aValue = a.personalEmail || '';
          bValue = b.personalEmail || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCandidates(filtered);
  }, [searchQuery, statusFilter, sortField, sortOrder, candidates]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  const handleRowClick = async (candidateId: string) => {
    try {
      setLoadingApplication(true);
      // Fetch all applications to find this candidate's applications
      const allApplications = await recruitmentApi.getAllApplications();
      const candidateApplications = allApplications.filter(
        app => app.candidateId._id === candidateId
      );

      if (candidateApplications.length > 0) {
        // Show the most recent application
        const mostRecentApp = candidateApplications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setSelectedApplicationId(mostRecentApp._id);
        setShowSidePanel(true);
      } else {
        alert('No applications found for this candidate');
      }
    } catch (err: any) {
      console.error('Error loading candidate applications:', err);
      alert('Failed to load candidate details');
    } finally {
      setLoadingApplication(false);
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'capitalize' as const,
    };

    switch (status) {
      case 'APPLIED':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'SCREENING':
        return { ...baseStyle, backgroundColor: '#e0e7ff', color: '#3730a3' };
      case 'INTERVIEW':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'OFFER_SENT':
        return { ...baseStyle, backgroundColor: '#ddd6fe', color: '#5b21b6' };
      case 'OFFER_ACCEPTED':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'HIRED':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'REJECTED':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'WITHDRAWN':
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(candidates.map(c => c.status).filter(Boolean)));

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--recruitment)" }}>
          Talent Pool
        </h1>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading candidates...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--recruitment)" }}>
          Talent Pool
        </h1>
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--error-bg)',
          borderRadius: '0.5rem',
          border: '1px solid var(--error)',
          color: 'var(--error)',
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", color: "var(--recruitment)", margin: 0 }}>
          Talent Pool
        </h1>
        <button
          onClick={loadCandidates}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--recruitment)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-color)',
      }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, or candidate number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: '1',
            minWidth: '250px',
            padding: "0.5rem 1rem",
            border: "1px solid var(--border-color)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid var(--border-color)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          <option value="all">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status?.replace('_', ' ')}
            </option>
          ))}
        </select>

        <span style={{
          display: 'flex',
          alignItems: 'center',
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          marginLeft: 'auto',
        }}>
          Showing: <strong style={{ marginLeft: '0.25rem' }}>{filteredCandidates.length}</strong> / {candidates.length}
        </span>
      </div>

      {/* Candidates Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.75rem',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '2px solid var(--border-color)',
              }}>
                <th
                  onClick={() => handleSort('fullName')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Candidate {sortField === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('candidateNumber')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Candidate # {sortField === 'candidateNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('personalEmail')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Email {sortField === 'personalEmail' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('applicationDate')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Application Date {sortField === 'applicationDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}>
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    No candidates found matching your filters
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(candidate => (
                  <tr
                    key={candidate._id}
                    onClick={() => handleRowClick(candidate._id)}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem',
                        }}>
                          {candidate.fullName ||
                            `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() ||
                            'N/A'}
                        </div>
                        {candidate.gender && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                          }}>
                            {candidate.gender}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                    }}>
                      {candidate.candidateNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={getStatusBadgeStyle(candidate.status)}>
                        {candidate.status?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: 'var(--text-primary)',
                    }}>
                      {candidate.personalEmail || 'N/A'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: 'var(--text-primary)',
                    }}>
                      {formatDate(candidate.applicationDate || candidate.createdAt)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                      }}>
                        {candidate.mobilePhone || 'N/A'}
                      </div>
                      {candidate.homePhone && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {candidate.homePhone}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel for Candidate Profile */}
      {showSidePanel && selectedApplicationId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50%",
            height: "100vh",
            backgroundColor: "var(--bg-primary)",
            boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            overflow: "auto",
          }}
        >
          <div style={{
            position: "sticky",
            top: 0,
            backgroundColor: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-color)",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
          }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
              Candidate Profile
            </h2>
            <button
              onClick={() => {
                setShowSidePanel(false);
                setSelectedApplicationId(null);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: "0" }}>
            <CandidateProfile
              applicationId={selectedApplicationId}
              onStageUpdate={loadCandidates}
            />
          </div>
        </div>
      )}

      {/* Backdrop overlay when side panel is open */}
      {showSidePanel && (
        <div
          onClick={() => {
            setShowSidePanel(false);
            setSelectedApplicationId(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "50%",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}
