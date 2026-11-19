import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, ListFilters, PaginatedResult } from '@/infrastructure/api';
import {
  fetchRoles,
  fetchRole,
  fetchRoleOptions,
  fetchPermissionCatalog,
  createRole,
  updateRole,
  deleteRoles,
} from './roles.api';
import type { RoleDto, RoleDetail, PermissionDto, RoleValues } from './roles.types';
export function useRoles(filters: ListFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<RoleDto>, ApiError>({
    queryKey: [...QUERY_KEYS.roles, i18n.language, filters],
    queryFn: ({ signal }) => fetchRoles(filters, signal),
  });
}
export function useRole(id?: string) {
  const { i18n } = useTranslation();
  return useQuery<RoleDetail, ApiError>({
    queryKey: [...QUERY_KEYS.roles, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchRole(id!, signal),
    enabled: Boolean(id),
  });
}
export function useRoleOptions() {
  const { i18n } = useTranslation();
  return useQuery<RoleDto[], ApiError>({
    queryKey: [...QUERY_KEYS.roles, QUERY_KEYS.options, i18n.language],
    queryFn: ({ signal }) => fetchRoleOptions(signal),
  });
}
export function usePermissionCatalog() {
  const { i18n } = useTranslation();
  return useQuery<PermissionDto[], ApiError>({
    queryKey: [...QUERY_KEYS.roles, QUERY_KEYS.permissions, i18n.language],
    queryFn: ({ signal }) => fetchPermissionCatalog(signal),
  });
}
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
