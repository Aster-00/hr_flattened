// useUpdateRolePermissions mutation hook
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRolePermissions, UpdateRolePermissionsInput, Role } from '../../api/roles.api';

interface UpdateRolePermissionsVariables {
  roleId: string;
  payload: UpdateRolePermissionsInput;
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, UpdateRolePermissionsVariables>({
    mutationFn: ({ roleId, payload }) => updateRolePermissions(roleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
