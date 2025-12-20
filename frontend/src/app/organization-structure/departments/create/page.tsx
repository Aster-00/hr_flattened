"use client";

import React, { useEffect, useState } from 'react';

export default function CreateDepartmentPage() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token'); // Assuming token is stored
      const response = await fetch('http://localhost:5000/organization-structure/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Department created successfully!');
        setFormData({
          code: '',
          name: '',
          description: '',
          isActive: true,
        });
      } else {
        const error = await response.text();
        setMessage(`Error: ${error}`);
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Create Department
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Add a new department to the organization
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="form-input"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid var(--border-medium)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid var(--border-medium)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows={3}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid var(--border-medium)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ marginRight: '0.5rem', width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}>
              Is Active
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              backgroundColor: 'var(--org-structure)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Creating...' : 'Create Department'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: message.includes('Error') ? 'var(--error-light)' : 'var(--success-light)',
            color: message.includes('Error') ? 'var(--error-dark)' : 'var(--success-dark)',
            borderLeft: `4px solid ${message.includes('Error') ? 'var(--error)' : 'var(--success)'}`,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
