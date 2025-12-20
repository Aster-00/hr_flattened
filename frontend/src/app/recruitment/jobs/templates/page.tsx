"use client";

import { useState, useEffect } from 'react';
import { JobTemplate, JobTemplateFormData } from '../../types';
import { recruitmentApi } from '../../services';

export default function JobTemplateManager() {
  const [jobTemplates, setJobTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState<JobTemplateFormData>({
    title: '',
    department: '',
    qualifications: [],
    skills: [],
    description: '',
  });

  // Input fields for adding qualifications and skills
  const [qualificationInput, setQualificationInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // Load job templates
  useEffect(() => {
    loadJobTemplates();
  }, []);

  const loadJobTemplates = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getAllJobTemplates();
      setJobTemplates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await recruitmentApi.updateJobTemplate(editingTemplate._id, formData);
      } else {
        await recruitmentApi.createJobTemplate(formData);
      }
      await loadJobTemplates();
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job template');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      qualifications: [],
      skills: [],
      description: '',
    });
    setQualificationInput('');
    setSkillInput('');
    setEditingTemplate(null);
  };

  const handleEdit = (template: JobTemplate) => {
    setFormData({
      title: template.title,
      department: template.department,
      qualifications: [...template.qualifications],
      skills: [...template.skills],
      description: template.description || '',
    });
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job template?')) {
      try {
        await recruitmentApi.deleteJobTemplate(id);
        await loadJobTemplates();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete job template');
      }
    }
  };

  const addQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, qualificationInput.trim()],
      });
      setQualificationInput('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading job templates...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)' }}>
          Job Template Manager
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
          {showForm ? 'Cancel' : 'Create New Template'}
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
            {editingTemplate ? 'Edit Job Template' : 'Create New Job Template'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              {/* Department */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                  placeholder="e.g., Engineering"
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                  placeholder="Job description and responsibilities..."
                />
              </div>

              {/* Qualifications */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Qualifications
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={qualificationInput}
                    onChange={(e) => setQualificationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                    placeholder="e.g., Bachelor's degree in Computer Science"
                  />
                  <button
                    type="button"
                    onClick={addQualification}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--recruitment)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.qualifications.map((qual, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {qual}
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c00',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          padding: '0',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Skills
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                    placeholder="e.g., React, Node.js, TypeScript"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--recruitment)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c00',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          padding: '0',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Job Templates List */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Job Templates ({jobTemplates.length})
        </h2>
        {jobTemplates.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
            No job templates found. Create your first template to get started.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {jobTemplates.map((template) => (
              <div
                key={template._id}
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
                      {template.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <span>Department: {template.department}</span>
                    </div>
                    {template.description && (
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {template.description}
                      </p>
                    )}

                    {/* Qualifications */}
                    {template.qualifications.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Qualifications:
                        </h4>
                        <ul style={{ marginLeft: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {template.qualifications.map((qual, index) => (
                            <li key={index}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills */}
                    {template.skills.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Skills:
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {template.skills.map((skill, index) => (
                            <span
                              key={index}
                              style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button
                      onClick={() => handleEdit(template)}
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
                    <button
                      onClick={() => handleDelete(template._id)}
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
