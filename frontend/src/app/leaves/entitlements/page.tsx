'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { checkAuth, User, hasRole as checkUserRole } from '@/app/lib/auth';
import { showToast } from '@/app/lib/toast';
import { assignPersonalizedEntitlement, bulkAssignEntitlements, PersonalizedEntitlementInput } from '../api/entitlements.api';
import { useLeaveTypes } from '../hooks/queries/useLeaveTypes';
import { getAllEmployees, Employee } from '../api/employees.api';

export default function EntitlementsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [assignForm, setAssignForm] = useState({  
    employeeId: '',
    leaveTypeId: '',
    year: new Date().getFullYear(),
    totalEntitlement: 0,
    carriedOver: 0,
  });
  const [bulkForm, setBulkForm] = useState({
    leaveTypeId: '',
    year: new Date().getFullYear(),
    totalEntitlement: 0,
    carriedOver: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { types: leaveTypes, isLoading: typesLoading } = useLeaveTypes();

  useEffect(() => {
    checkAuth().then(setUser);
    
    // Fetch real employees from employee-profile service
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        showToast('Failed to load employees', 'error');
      } finally {
        setEmployeesLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const isHR = checkUserRole(user, 'HR Manager') || checkUserRole(user, 'HR Admin') || checkUserRole(user, 'System Admin');

  const handleAssign = async () => {
    if (!assignForm.employeeId || !assignForm.leaveTypeId || assignForm.totalEntitlement <= 0) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await assignPersonalizedEntitlement({
        employeeId: assignForm.employeeId,
        leaveTypeId: assignForm.leaveTypeId,
        year: assignForm.year,
        totalEntitlement: assignForm.totalEntitlement,
        carriedOver: assignForm.carriedOver || 0,
      });
      showToast('Entitlement assigned successfully', 'success');
      setShowAssignModal(false);
      setAssignForm({
        employeeId: '',
        leaveTypeId: '',
        year: new Date().getFullYear(),
        totalEntitlement: 0,
        carriedOver: 0,
      });
    } catch (error: any) {
      console.error('Failed to assign entitlement:', error);
      showToast(error.response?.data?.message || 'Failed to assign entitlement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedEmployees.size === 0) {
      showToast('Please select at least one employee', 'warning');
      return;
    }
    if (!bulkForm.leaveTypeId || bulkForm.totalEntitlement <= 0) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignments = Array.from(selectedEmployees).map(employeeId => ({
        employeeId,
        leaveTypeId: bulkForm.leaveTypeId,
        year: bulkForm.year,
        totalEntitlement: bulkForm.totalEntitlement,
        carriedOver: bulkForm.carriedOver || 0,
      }));

      const result = await bulkAssignEntitlements(assignments);
      showToast(`Successfully assigned entitlements to ${result.count} employees`, 'success');
      setShowBulkModal(false);
      setSelectedEmployees(new Set());
      setBulkForm({
        leaveTypeId: '',
        year: new Date().getFullYear(),
        totalEntitlement: 0,
        carriedOver: 0,
      });
    } catch (error: any) {
      console.error('Failed to bulk assign entitlements:', error);
      showToast(error.response?.data?.message || 'Failed to bulk assign entitlements', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(e => e._id)));
    }
  };

  if (!isHR) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--error-light)' }}>
            <svg style={{ width: '2.5rem', height: '2.5rem', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Access Denied</h2>
          <p style={{ color: 'var(--gray-600)' }}>You do not have permission to view this page. Only HR can manage entitlements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaves-container">
      {/* Hero Header */}
      <div style={{
        background: `linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '2rem'
      }}>
        <div className="leaves-content" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Leave Entitlements</h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Assign and manage employee leave entitlements</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAssignModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  color: 'var(--primary-600)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Assign Single
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                disabled={selectedEmployees.size === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: selectedEmployees.size > 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)',
                  color: selectedEmployees.size > 0 ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: selectedEmployees.size > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Bulk Assign ({selectedEmployees.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="leaves-content" style={{ padding: '0 1.5rem 2rem' }}>
        {/* Info Card */}
        <div className="leaves-card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>About Entitlements</h3>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
                Use this page to assign personalized leave entitlements to employees. You can set custom annual days and carryover amounts for each employee and leave type. 
                Entitlements are created per year and can be adjusted as needed.
              </p>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="leaves-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Employees</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'center', width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={employees.length > 0 && selectedEmployees.size === employees.length}
                      onChange={toggleSelectAll}
                      style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Employee ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeesLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '1rem', 
                          height: '1rem',
                          border: '2px solid var(--primary-600)',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                        Loading employees...
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No employees found
                    </td>
                  </tr>
                ) : employees.map((employee) => (
                  <tr key={employee._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee._id)}
                        onChange={() => toggleEmployeeSelection(employee._id)}
                        style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{employee.employeeId}</td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{employee.workEmail}</td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setAssignForm({ ...assignForm, employeeId: employee._id });
                          setShowAssignModal(true);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-600)',
                          border: '1px solid var(--primary-200)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
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
          onClick={() => !isSubmitting && setShowAssignModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Assign Leave Entitlement
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Employee <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Leave Type <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={assignForm.leaveTypeId}
                  onChange={(e) => setAssignForm({ ...assignForm, leaveTypeId: e.target.value })}
                  disabled={typesLoading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Select leave type...</option>
                  {leaveTypes?.map((type: any) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Year <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={assignForm.year}
                  onChange={(e) => setAssignForm({ ...assignForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Total Entitlement (Days) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={assignForm.totalEntitlement}
                  onChange={(e) => setAssignForm({ ...assignForm, totalEntitlement: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Carried Over (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={assignForm.carriedOver}
                  onChange={(e) => setAssignForm({ ...assignForm, carriedOver: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={isSubmitting}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'white',
                  color: 'var(--text-primary)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={isSubmitting || !assignForm.employeeId || !assignForm.leaveTypeId || assignForm.totalEntitlement <= 0}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: 'var(--primary-600)',
                  color: 'white',
                  cursor: (isSubmitting || !assignForm.employeeId || !assignForm.leaveTypeId || assignForm.totalEntitlement <= 0) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: (isSubmitting || !assignForm.employeeId || !assignForm.leaveTypeId || assignForm.totalEntitlement <= 0) ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Assigning...' : 'Assign Entitlement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkModal && (
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
          onClick={() => !isSubmitting && setShowBulkModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Bulk Assign Leave Entitlement
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Assigning to {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? 's' : ''}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Leave Type <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={bulkForm.leaveTypeId}
                  onChange={(e) => setBulkForm({ ...bulkForm, leaveTypeId: e.target.value })}
                  disabled={typesLoading}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Select leave type...</option>
                  {leaveTypes?.map((type: any) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Year <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={bulkForm.year}
                  onChange={(e) => setBulkForm({ ...bulkForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Total Entitlement (Days) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulkForm.totalEntitlement}
                  onChange={(e) => setBulkForm({ ...bulkForm, totalEntitlement: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Carried Over (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={bulkForm.carriedOver}
                  onChange={(e) => setBulkForm({ ...bulkForm, carriedOver: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBulkModal(false)}
                disabled={isSubmitting}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'white',
                  color: 'var(--text-primary)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={isSubmitting || !bulkForm.leaveTypeId || bulkForm.totalEntitlement <= 0}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: 'var(--primary-600)',
                  color: 'white',
                  cursor: (isSubmitting || !bulkForm.leaveTypeId || bulkForm.totalEntitlement <= 0) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: (isSubmitting || !bulkForm.leaveTypeId || bulkForm.totalEntitlement <= 0) ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Assigning...' : `Assign to ${selectedEmployees.size} Employee${selectedEmployees.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
