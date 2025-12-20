"use client";

import React, { useEffect, useState } from 'react';

type Department = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headPositionId?: string;
  isActive: boolean;
};

type Position = {
  _id: string;
  title: string;
  code: string;
};

export default function DeleteDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        console.log("TOKEN FROM STORAGE:", token);

        if (!token) {
          setMessage("Authentication required. Please log in.");
          return;
        }

        const [deptRes, posRes] = await Promise.all([
          fetch("http://localhost:5000/organization-structure/departments", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/organization-structure/positions", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        if (deptRes.ok) {
          try {
            const deptData = await deptRes.json();
            const normalizedDepartments = Array.isArray(deptData) ? deptData.map((dept: any) => ({
              ...dept,
              headPositionId: typeof dept.headPositionId === 'object' && dept.headPositionId?._id
                ? dept.headPositionId._id
                : dept.headPositionId,
            })) : [];
            setDepartments(normalizedDepartments);
          } catch (parseError) {
            console.error("Error parsing departments JSON:", parseError);
            setMessage("Failed to parse departments data");
          }
        } else {
          try {
            const errorText = await deptRes.text();
            setMessage(`Failed to load departments (${deptRes.status}): ${errorText}`);
          } catch (error) {
            setMessage(`Failed to load departments (${deptRes.status})`);
          }
        }

        if (posRes.ok) {
          try {
            const posData = await posRes.json();
            setPositions(Array.isArray(posData) ? posData : []);
          } catch (parseError) {
            console.error("Error parsing positions JSON:", parseError);
            setMessage("Failed to parse positions data");
          }
        } else {
          try {
            const errorText = await posRes.text();
            setMessage(`Failed to load positions (${posRes.status}): ${errorText}`);
          } catch (error) {
            setMessage(`Failed to load positions (${posRes.status})`);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage("Failed to load departments and positions");
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setMessage('Please enter department ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this department?')) return;

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/organization-structure/departments/${selectedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('Department deleted successfully!');
        setSelectedId("")
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

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--border-medium)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const focusStyle = {
    outline: 'none',
    borderColor: 'var(--border-focus)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--org-structure)', marginBottom: '0.5rem' }}>
          Delete Department
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Remove a department from the organization
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
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Select Department
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-medium)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Select a Department --</option>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))
              ) : (
                <option value="" disabled>No departments available</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--error)',
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
                e.currentTarget.style.backgroundColor = 'var(--error-dark)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--error)';
              }
            }}
          >
            {loading ? 'Deleting...' : 'Delete Department'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: message.includes('error') ? 'var(--error-light)' : 'var(--success-light)',
            color: message.includes('error') ? 'var(--error-dark)' : 'var(--success-dark)',
            borderLeft: `4px solid ${message.includes('error') ? 'var(--error)' : 'var(--success)'}`,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
