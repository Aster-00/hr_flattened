"use client";

import React, { useState, useEffect } from 'react';
import { recruitmentApi } from '../../services';
import { Employee } from '../../types';

interface EmployeeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employeeId: string, employeeName: string) => void;
  title?: string;
}

export default function EmployeeSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Referring Employee"
}: EmployeeSelectionModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruitmentApi.getAllEmployeesForSelection();
      setEmployees(data);
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.toLowerCase();
    const employeeNumber = emp.employeeNumber?.toLowerCase() || '';
    return fullName.includes(searchLower) || employeeNumber.includes(searchLower);
  });

  const handleSelect = () => {
    if (!selectedEmployeeId) return;

    const selectedEmployee = employees.find(emp => emp._id === selectedEmployeeId);
    if (selectedEmployee) {
      const employeeName = `${selectedEmployee.personalInfo?.firstName || ''} ${selectedEmployee.personalInfo?.lastName || ''}`;
      onSelect(selectedEmployeeId, employeeName);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedEmployeeId(null);
    onClose();
  };

  if (!isOpen) return null;

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
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            {title}
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search by name or employee number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading employees...
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && filteredEmployees.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No employees found
            </div>
          )}

          {!loading && !error && filteredEmployees.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredEmployees.map((emp) => (
                <div
                  key={emp._id}
                  onClick={() => setSelectedEmployeeId(emp._id)}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${selectedEmployeeId === emp._id ? 'var(--recruitment)' : 'var(--border-color)'}`,
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    backgroundColor: selectedEmployeeId === emp._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEmployeeId !== emp._id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEmployeeId !== emp._id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {emp.personalInfo?.firstName || ''} {emp.personalInfo?.lastName || ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {emp.employeeNumber}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--text-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
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
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedEmployeeId}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: selectedEmployeeId ? 'var(--recruitment)' : 'var(--text-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: selectedEmployeeId ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.2s ease',
              opacity: selectedEmployeeId ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (selectedEmployeeId) {
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedEmployeeId) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
