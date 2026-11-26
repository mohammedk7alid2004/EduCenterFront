import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { RoleValues } from '../types';
import { createRole, updateRole, deleteRoles } from './roles.commands.api';

export function useSaveRole(id?: string) {
  const client = useQueryClient();
  return useMutation<void, ApiError, RoleValues>({
    mutationFn: async (values) => {
      if (id) await updateRole(id, values);
      else await createRole(values);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.roles });
      void client.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  });
}

export function useDeleteRoles() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteRoles(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    },
  });
}
