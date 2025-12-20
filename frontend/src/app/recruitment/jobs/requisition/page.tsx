"use client";

import { useState, useEffect } from 'react';
import { JobRequisition, JobRequisitionFormData, JobTemplate, Employee } from '../../types';
import { recruitmentApi } from '../../services';

export default function JobRequisitionManager() {
  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>([]);
  const [jobTemplates, setJobTemplates] = useState<JobTemplate[]>([]);
  const [hrManagers, setHrManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<JobRequisitionFormData>({
    requisitionId: '',
    templateId: '',
    location: '',
    openings: 1,
    hiringManagerId: '',
    expiryDate: '',
  });

  // Load job requisitions and templates
  useEffect(() => {
    loadJobRequisitions();
    loadJobTemplates();
    loadHrManagers();
  }, []);

  const loadJobRequisitions = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getAllJobRequisitions();
      setJobRequisitions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job requisitions');
    } finally {
      setLoading(false);
    }
  };

  const loadJobTemplates = async () => {
    try {
      const data = await recruitmentApi.getAllJobTemplates();
      setJobTemplates(data);
    } catch (err) {
      console.error('Failed to load job templates:', err);
      // Don't set error state here as templates are optional
    }
  };

  const loadHrManagers = async () => {
    try {
      const data = await recruitmentApi.getEmployeesByRole('HR Manager');
      setHrManagers(data);
    } catch (err) {
      console.error('Failed to load HR Managers:', err);
      // Don't set error state here as this is optional
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing requisition
        await recruitmentApi.updateJobRequisition(editingId, formData);
      } else {
        // Auto-generate requisitionId if not provided
        const dataToSend = {
          ...formData,
          requisitionId: formData.requisitionId || `REQ-${Date.now()}`,
        };
        await recruitmentApi.createJobRequisition(dataToSend);
      }
      await loadJobRequisitions();
      resetForm();
      setShowForm(false);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingId ? 'update' : 'create'} job requisition`);
    }
  };

  const resetForm = () => {
    setFormData({
      requisitionId: '',
      templateId: '',
      location: '',
      openings: 1,
      hiringManagerId: '',
      expiryDate: '',
    });
    setEditingId(null);
  };

  const handleEdit = (job: JobRequisition) => {
    // Extract the templateId - handle both populated and non-populated cases
    const templateId = typeof job.templateId === 'object' && job.templateId !== null
      ? (job.templateId as any)._id
      : job.templateId || '';

    // Extract the hiringManagerId - handle both populated and non-populated cases
    const hiringManagerId = typeof job.hiringManagerId === 'object' && job.hiringManagerId !== null
      ? (job.hiringManagerId as any)._id
      : job.hiringManagerId || '';

    setFormData({
      requisitionId: job.requisitionId,
      templateId,
      location: job.location,
      openings: job.openings,
      hiringManagerId,
      expiryDate: job.expiryDate ? new Date(job.expiryDate).toISOString().split('T')[0] : '',
    });
    setEditingId(job._id);
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published' | 'closed') => {
    try {
      await recruitmentApi.updateJobRequisitionStatus(id, { status });
      await loadJobRequisitions();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job requisition?')) {
      try {
        await recruitmentApi.deleteJobRequisition(id);
        await loadJobRequisitions();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete job requisition');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading job requisitions...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)' }}>
          Job Requisition Manager
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--recruitment)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : 'Create New Requisition'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '0.5rem',
          color: '#c00',
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          padding: '2rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            {editingId ? 'Edit Job Requisition' : 'Create New Job Requisition'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Requisition ID */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Requisition ID (auto-generated if empty)
                </label>
                <input
                  type="text"
                  value={formData.requisitionId}
                  onChange={(e) => setFormData({ ...formData, requisitionId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                  placeholder="e.g., REQ-2025-001 (optional)"
                />
              </div>

              {/* Template Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Job Template (optional)
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select a template --</option>
                  {jobTemplates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.title} ({template.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hiring Manager Selection */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Hiring Manager *
                </label>
                <select
                  required
                  value={formData.hiringManagerId}
                  onChange={(e) => setFormData({ ...formData, hiringManagerId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select a hiring manager --</option>
                  {hrManagers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.personalInfo?.firstName} {manager.personalInfo?.lastName} ({manager.workEmail})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location and Openings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                    placeholder="e.g., New York, NY"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Number of Openings *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--recruitment)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {editingId ? 'Update Requisition' : 'Create Requisition'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Job Requisitions List */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Job Requisitions ({jobRequisitions.length})
        </h2>
        {jobRequisitions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
            No job requisitions found. Create your first requisition to get started.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {jobRequisitions.map((job) => (
              <div
                key={job._id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {job.requisitionId}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                      {job.templateId && (
                        <>
                          <span>•</span>
                          <span>Template: {typeof job.templateId === 'object' ? job.templateId.title : job.templateId}</span>
                        </>
                      )}
                    </div>
                    {job.expiryDate && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        Expires: {new Date(job.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor:
                            job.publishStatus === 'published' ? '#e6ffe6' :
                            job.publishStatus === 'closed' ? '#ffe6e6' : '#fff4e6',
                          color:
                            job.publishStatus === 'published' ? '#006600' :
                            job.publishStatus === 'closed' ? '#cc0000' : '#cc6600',
                        }}
                      >
                        {job.publishStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button
                      onClick={() => handleEdit(job)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--recruitment)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}
                    >
                      Edit
                    </button>
                    <select
                      value={job.publishStatus}
                      onChange={(e) => handleStatusChange(job._id, e.target.value as any)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(job._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#fee',
                        color: '#c00',
                        border: '1px solid #fcc',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
