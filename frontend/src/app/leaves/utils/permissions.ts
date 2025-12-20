/**
 * Permission utility functions for leaves module
 */

/**
 * System roles enum (matches backend)
 */
export enum SystemRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  HR_ADMIN = 'HR_ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  HR_EMPLOYEE = 'HR_EMPLOYEE',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  DEPARTMENT_EMPLOYEE = 'DEPARTMENT_EMPLOYEE',
  PAYROLL_SPECIALIST = 'PAYROLL_SPECIALIST',
  PAYROLL_MANAGER = 'PAYROLL_MANAGER',
  LEGAL_POLICY_ADMIN = 'LEGAL_POLICY_ADMIN',
  RECRUITER = 'RECRUITER',
  FINANCE_STAFF = 'FINANCE_STAFF',
  JOB_CANDIDATE = 'JOB_CANDIDATE',
}

/**
 * Permission types for leaves module
 */
export type LeavePermission =
  | 'leaves.view.own'
  | 'leaves.view.team'
  | 'leaves.view.all'
  | 'leaves.create'
  | 'leaves.update.own'
  | 'leaves.update.all'
  | 'leaves.delete.own'
  | 'leaves.delete.all'
  | 'leaves.approve.manager'
  | 'leaves.approve.hr'
  | 'leaves.finalize'
  | 'leaves.override'
  | 'leaves.types.manage'
  | 'leaves.policies.manage'
  | 'leaves.balances.adjust'
  | 'leaves.reports.view'
  | 'leaves.reports.export';

/**
 * Role permissions mapping
 */
const ROLE_PERMISSIONS: Record<SystemRole, LeavePermission[]> = {
  [SystemRole.SYSTEM_ADMIN]: [
    'leaves.view.all',
    'leaves.create',
    'leaves.update.all',
    'leaves.delete.all',
    'leaves.approve.manager',
    'leaves.approve.hr',
    'leaves.finalize',
    'leaves.override',
    'leaves.types.manage',
    'leaves.policies.manage',
    'leaves.balances.adjust',
    'leaves.reports.view',
    'leaves.reports.export',
  ],
  [SystemRole.HR_ADMIN]: [
    'leaves.view.all',
    'leaves.create',
    'leaves.update.all',
    'leaves.delete.all',
    'leaves.approve.manager',
    'leaves.approve.hr',
    'leaves.finalize',
    'leaves.override',
    'leaves.types.manage',
    'leaves.policies.manage',
    'leaves.balances.adjust',
    'leaves.reports.view',
    'leaves.reports.export',
  ],
  [SystemRole.HR_MANAGER]: [
    'leaves.view.all',
    'leaves.create',
    'leaves.update.all',
    'leaves.approve.manager',
    'leaves.approve.hr',
    'leaves.finalize',
    'leaves.override',
    'leaves.policies.manage',
    'leaves.reports.view',
    'leaves.reports.export',
  ],
  [SystemRole.HR_EMPLOYEE]: [
    'leaves.view.all',
    'leaves.create',
    'leaves.update.own',
    'leaves.reports.view',
  ],
  [SystemRole.DEPARTMENT_HEAD]: [
    'leaves.view.own',
    'leaves.view.team',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
    'leaves.approve.manager',
    'leaves.reports.view',
  ],
  [SystemRole.DEPARTMENT_EMPLOYEE]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
  [SystemRole.PAYROLL_SPECIALIST]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
  [SystemRole.PAYROLL_MANAGER]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
  [SystemRole.LEGAL_POLICY_ADMIN]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
  [SystemRole.RECRUITER]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
  [SystemRole.FINANCE_STAFF]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
  [SystemRole.JOB_CANDIDATE]: [
    'leaves.view.own',
    'leaves.create',
    'leaves.update.own',
    'leaves.delete.own',
  ],
};

/**
 * Gets all permissions for a role
 * @param role - System role
 * @returns Array of permissions
 */
export function getPermissionsForRole(role: SystemRole): LeavePermission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Checks if a role has a specific permission
 * @param role - System role
 * @param permission - Permission to check
 * @returns True if role has permission
 */
export function hasPermission(role: SystemRole, permission: LeavePermission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Checks if a role has any of the specified permissions
 * @param role - System role
 * @param permissions - Permissions to check
 * @returns True if role has at least one permission
 */
export function hasAnyPermission(
  role: SystemRole,
  permissions: LeavePermission[]
): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Checks if a role has all of the specified permissions
 * @param role - System role
 * @param permissions - Permissions to check
 * @returns True if role has all permissions
 */
export function hasAllPermissions(
  role: SystemRole,
  permissions: LeavePermission[]
): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Checks if a user can view leaves
 * @param role - System role
 * @param scope - View scope ('own', 'team', 'all')
 * @returns True if user can view leaves in the specified scope
 */
export function canViewLeaves(role: SystemRole, scope: 'own' | 'team' | 'all'): boolean {
  switch (scope) {
    case 'own':
      return hasPermission(role, 'leaves.view.own') || hasPermission(role, 'leaves.view.all');
    case 'team':
      return hasPermission(role, 'leaves.view.team') || hasPermission(role, 'leaves.view.all');
    case 'all':
      return hasPermission(role, 'leaves.view.all');
    default:
      return false;
  }
}

/**
 * Checks if a user can approve leaves as a manager
 * @param role - System role
 * @returns True if user can approve as manager
 */
export function canApproveAsManager(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.approve.manager');
}

/**
 * Checks if a user can approve leaves as HR
 * @param role - System role
 * @returns True if user can approve as HR
 */
export function canApproveAsHR(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.approve.hr');
}

/**
 * Checks if a user can finalize leaves
 * @param role - System role
 * @returns True if user can finalize leaves
 */
export function canFinalizeLeaves(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.finalize');
}

/**
 * Checks if a user can override leave decisions
 * @param role - System role
 * @returns True if user can override decisions
 */
export function canOverrideLeaves(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.override');
}

/**
 * Checks if a user can manage leave types
 * @param role - System role
 * @returns True if user can manage leave types
 */
export function canManageLeaveTypes(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.types.manage');
}

/**
 * Checks if a user can manage leave policies
 * @param role - System role
 * @returns True if user can manage leave policies
 */
export function canManageLeavePolicies(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.policies.manage');
}

/**
 * Checks if a user can adjust leave balances
 * @param role - System role
 * @returns True if user can adjust balances
 */
export function canAdjustBalances(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.balances.adjust');
}

/**
 * Checks if a user can view leave reports
 * @param role - System role
 * @returns True if user can view reports
 */
export function canViewReports(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.reports.view');
}

/**
 * Checks if a user can export leave reports
 * @param role - System role
 * @returns True if user can export reports
 */
export function canExportReports(role: SystemRole): boolean {
  return hasPermission(role, 'leaves.reports.export');
}

/**
 * Gets the user's role from localStorage (JWT token would be decoded in real app)
 * @returns User's system role or null if not authenticated
 */
export function getCurrentUserRole(): SystemRole | null {
  // In a real application, this would decode the JWT token
  // For now, we'll try to get it from localStorage or return null
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // In a real app, you would decode the JWT here
    // For now, return null to indicate role should be fetched from backend
    return null;
  } catch {
    return null;
  }
}

// UI role gating helpers
