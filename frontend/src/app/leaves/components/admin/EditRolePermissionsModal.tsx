// EditRolePermissionsModal component
'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateRolePermissions } from '../../hooks/mutations/useUpdateRolePermissions';
import type { Role } from '../../api/roles.api';
import { showToast } from '@/app/lib/toast';

interface EditRolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

interface PermissionGroup {
  category: string;
  icon: string;
  permissions: {
    key: string;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: 'Leave Requests',
    icon: '📝',
    permissions: [
      { key: 'leave:submit', label: 'Submit Leave Requests', description: 'Create and submit new leave requests' },
      { key: 'leave:modify', label: 'Modify Leave Requests', description: 'Edit pending leave requests' },
      { key: 'leave:cancel', label: 'Cancel Leave Requests', description: 'Cancel submitted requests' },
      { key: 'leave:view-own', label: 'View Own Requests', description: 'View own leave history and status' },
      { key: 'leave:view-team', label: 'View Team Requests', description: 'View team members leave requests' },
      { key: 'leave:view-all', label: 'View All Requests', description: 'View all organization leave requests' },
    ],
  },
  {
    category: 'Approvals',
    icon: '✅',
    permissions: [
      { key: 'approval:approve', label: 'Approve Requests', description: 'Approve team leave requests' },
      { key: 'approval:reject', label: 'Reject Requests', description: 'Reject leave requests with reason' },
      { key: 'approval:return', label: 'Return for Correction', description: 'Send requests back for changes' },
      { key: 'approval:finalize', label: 'Finalize Requests', description: 'HR final approval step' },
      { key: 'approval:override', label: 'Override Decisions', description: 'Override previous decisions' },
    ],
  },
  {
    category: 'Policy Setup',
    icon: '⚙️',
    permissions: [
      { key: 'policy:manage-types', label: 'Manage Leave Types', description: 'Create and edit leave types' },
      { key: 'policy:configure', label: 'Configure Policies', description: 'Set up leave policies and rules' },
      { key: 'policy:manage-calendars', label: 'Manage Calendars', description: 'Configure holidays and blocked periods' },
    ],
  },
  {
    category: 'Reports',
    icon: '📊',
    permissions: [
      { key: 'reports:view-own', label: 'View Own Reports', description: 'Access personal leave reports' },
      { key: 'reports:view-team', label: 'View Team Reports', description: 'Access team leave analytics' },
      { key: 'reports:view-all', label: 'View All Reports', description: 'Access organization-wide reports' },
    ],
  },
];

export default function EditRolePermissionsModal({ 
  isOpen, 
  onClose, 
  role, 
  onSuccess 
}: EditRolePermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  
  const updatePermissions = useUpdateRolePermissions();


  useEffect(() => {
    if (isOpen && role) {
      setSelectedPermissions(role.permissions || []);
      setShowWarning(false);
    }
  }, [isOpen, role]);

  const togglePermission = (permissionKey: string) => {
    if (role?.name === 'admin') {
      showToast('Admin permissions cannot be modified', 'error');
      return;
    }

    if (selectedPermissions.includes(permissionKey)) {
      const criticalPermissions = ['leave:view-own', 'leave:submit'];
      if (criticalPermissions.includes(permissionKey) && role?.name === 'employee') {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionKey));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionKey]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return;

    if (role.name === 'admin') {
      showToast('Admin permissions cannot be modified', 'error');
      return;
    }

    try {
      await updatePermissions.mutateAsync({
        roleId: role._id,
        payload: { permissions: selectedPermissions },
      });
      showToast('Role permissions updated successfully', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update permissions';
      showToast(errorMessage, 'error');
    }
  };

  if (!isOpen || !role) return null;

  const isAdminRole = role.name === 'admin';

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 50
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 51,
          padding: '16px'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#111827',
                margin: 0
              }}>
                Edit Role Permissions
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)} - {role.description}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ×
            </button>
          </div>

          {/* Admin Warning */}
          {isAdminRole && (
            <div style={{
              margin: '24px 24px 0',
              padding: '16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              display: 'flex',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#92400e',
                  margin: '0 0 4px'
                }}>
                  Admin Role Protected
                </p>
                <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                  Admin permissions cannot be modified to maintain system security.
                </p>
              </div>
            </div>
          )}

          {/* Critical Permission Warning */}
          {showWarning && (
            <div style={{
              margin: '24px 24px 0',
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              animation: 'fadeIn 0.3s'
            }}>
              <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>
                ⚠️ Warning: Removing critical permissions may affect basic functionality
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.category} style={{ marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '24px' }}>{group.icon}</span>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {group.category}
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '12px'
                }}>
                  {group.permissions.map((permission) => {
                    const isChecked = selectedPermissions.includes(permission.key);
                    return (
                      <label
                        key={permission.key}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: isChecked ? '#eff6ff' : '#f9fafb',
                          border: isChecked ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: isAdminRole ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          opacity: isAdminRole ? 0.6 : 1
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(permission.key)}
                          disabled={isAdminRole}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: isAdminRole ? 'not-allowed' : 'pointer',
                            marginTop: '2px',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#111827',
                            marginBottom: '2px'
                          }}>
                            {permission.label}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            {permission.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              {!isAdminRole && (
                <button
                  type="submit"
                  disabled={updatePermissions.isPending}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: updatePermissions.isPending ? '#9ca3af' : '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: updatePermissions.isPending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!updatePermissions.isPending) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!updatePermissions.isPending) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  {updatePermissions.isPending && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                  )}
                  {updatePermissions.isPending ? 'Saving...' : 'Save Permissions'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
