// Roles API functions
import { leavesApiClient } from './leaves.client';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount?: number;
}

export interface UpdateRolePermissionsInput {
  permissions: string[];
}

// GET /roles
export async function getRoles(): Promise<Role[]> {
  const { data } = await leavesApiClient.get<Role[]>('/roles');
  return data;
}

// PATCH /roles/:id/permissions
export async function updateRolePermissions(
  roleId: string,
  payload: UpdateRolePermissionsInput
): Promise<Role> {
  const { data } = await leavesApiClient.patch<Role>(
    `/roles/${roleId}/permissions`,
    payload
  );
  return data;
}
