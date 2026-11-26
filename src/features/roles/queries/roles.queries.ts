import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ListFilters, PaginatedResult } from '@/shared/types';
import {
  fetchRoles,
  fetchRole,
  fetchRoleOptions,
  fetchPermissionCatalog,
} from './roles.queries.api';
import type { RoleDto, RoleDetail, PermissionDto } from '../types';

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
