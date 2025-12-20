"use client";

import { useState, useEffect } from 'react';
import { recruitmentApi } from '../../services';
import { ApplicationWithDetails } from '../../types';
import { useRouter } from 'next/navigation';

type SortField = 'candidateName' | 'jobTitle' | 'status' | 'stage' | 'applicationDate';
type SortOrder = 'asc' | 'desc';

export default function ApplicationsList() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('applicationDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruitmentApi.getAllApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => {
        const candidateName = app.candidateId?.fullName ||
                             `${app.candidateId?.firstName || ''} ${app.candidateId?.lastName || ''}`.trim();
        const candidateNumber = app.candidateId?.candidateNumber || '';
        const jobTitle = app.requisitionId?.templateId?.title || '';
        const email = app.candidateId?.personalEmail || '';

        return candidateName.toLowerCase().includes(query) ||
               candidateNumber.toLowerCase().includes(query) ||
               jobTitle.toLowerCase().includes(query) ||
               email.toLowerCase().includes(query);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(app => app.currentStage === stageFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'candidateName':
          aValue = (a.candidateId?.fullName || `${a.candidateId?.firstName || ''} ${a.candidateId?.lastName || ''}`).toLowerCase();
          bValue = (b.candidateId?.fullName || `${b.candidateId?.firstName || ''} ${b.candidateId?.lastName || ''}`).toLowerCase();
          break;
        case 'jobTitle':
          aValue = (a.requisitionId?.templateId?.title || '').toLowerCase();
          bValue = (b.requisitionId?.templateId?.title || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'stage':
          aValue = a.currentStage;
          bValue = b.currentStage;
          break;
        case 'applicationDate':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredApplications(filtered);
  }, [searchQuery, statusFilter, stageFilter, sortField, sortOrder, applications]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (applicationId: string) => {
    router.push(`/recruitment/candidates/${applicationId}`);
  };

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'capitalize' as const,
    };

    switch (status) {
      case 'submitted':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'in_process':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'offer':
        return { ...baseStyle, backgroundColor: '#ddd6fe', color: '#5b21b6' };
      case 'hired':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStageBadgeStyle = (stage: string) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'capitalize' as const,
    };

    switch (stage) {
      case 'screening':
        return { ...baseStyle, backgroundColor: '#e0e7ff', color: '#3730a3' };
      case 'department_interview':
        return { ...baseStyle, backgroundColor: '#fce7f3', color: '#831843' };
      case 'hr_interview':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#78350f' };
      case 'offer':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique statuses and stages for filters
  const uniqueStatuses = Array.from(new Set(applications.map(app => app.status)));
  const uniqueStages = Array.from(new Set(applications.map(app => app.currentStage)));

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--recruitment)" }}>
          All Applications
        </h1>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--recruitment)" }}>
          All Applications
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
          All Applications
        </h1>
        <button
          onClick={loadApplications}
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
          placeholder="Search by name, email, job title, or candidate number..."
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
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
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
          <option value="all">All Stages</option>
          {uniqueStages.map(stage => (
            <option key={stage} value={stage}>
              {stage.replace('_', ' ').charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}
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
          Showing: <strong style={{ marginLeft: '0.25rem' }}>{filteredApplications.length}</strong> / {applications.length}
        </span>
      </div>

      {/* Applications Table */}
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
                  onClick={() => handleSort('candidateName')}
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
                  Candidate {sortField === 'candidateName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('jobTitle')}
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
                  Job Title {sortField === 'jobTitle' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  onClick={() => handleSort('stage')}
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
                  Current Stage {sortField === 'stage' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  Contact
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    No applications found matching your filters
                  </td>
                </tr>
              ) : (
                filteredApplications.map(app => (
                  <tr
                    key={app._id}
                    onClick={() => handleRowClick(app._id)}
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
                          {app.candidateId?.fullName ||
                           `${app.candidateId?.firstName || ''} ${app.candidateId?.lastName || ''}`.trim() ||
                           'N/A'}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {app.candidateId?.candidateNumber || 'N/A'}
                        </div>
                        {app.isReferral && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            padding: '0.125rem 0.5rem',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '0.25rem',
                            fontSize: '0.625rem',
                            fontWeight: '600',
                          }}>
                            REFERRAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem',
                        }}>
                          {app.requisitionId?.templateId?.title || 'N/A'}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {app.requisitionId?.templateId?.department || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={getStatusBadgeStyle(app.status)}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={getStageBadgeStyle(app.currentStage)}>
                        {app.currentStage.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: 'var(--text-primary)',
                    }}>
                      {formatDate(app.createdAt)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                      }}>
                        {app.candidateId?.personalEmail || 'N/A'}
                      </div>
                      {app.candidateId?.mobilePhone && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}>
                          {app.candidateId.mobilePhone}
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
    </div>
  );
}
