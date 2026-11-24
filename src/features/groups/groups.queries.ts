import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchGroups,
  fetchGroup,
  deleteGroups,
  exportGroups,
  connectStudentsToGroup,
  fetchStudentsOption,
  fetchGroupOptions,
  type GroupOptionItem,
} from './groups.api';
import type { GroupDto, GroupFilters, ConnectStudentsPayload, StudentOption } from './groups.types';
import { GROUP_CALENDAR_PAGE_SIZE } from './groups.constants';

export function useGroups(filters: GroupFilters, calendar = false, enabled = true) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<GroupDto>, ApiError>({
    queryKey: [...QUERY_KEYS.groups, i18n.language, filters, calendar],
    queryFn: async ({ signal }) => {
      if (!calendar) return fetchGroups(filters, signal);
      const first = await fetchGroups(
        { ...filters, pageNumber: 1, pageSize: GROUP_CALENDAR_PAGE_SIZE },
        signal,
      );
      const items = [...first.items];
      for (let page = 2; page <= first.totalPages; page++) {
        const next = await fetchGroups(
          { ...filters, pageNumber: page, pageSize: GROUP_CALENDAR_PAGE_SIZE },
          signal,
        );
        items.push(...next.items);
      }
      return { ...first, items };
    },
    enabled,
  });
}

export function useGroup(id?: string) {
  const { i18n } = useTranslation();
  return useQuery<GroupDto, ApiError>({
    queryKey: [...QUERY_KEYS.groups, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchGroup(id!, signal),
    enabled: Boolean(id),
  });
}

export function useDeleteGroups() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteGroups(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      void client.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}
export function useGroupsExport() {
  return useMutation<Blob, ApiError, GroupFilters>({
    mutationFn: (filters) => exportGroups(filters),
  });
}

export function useConnectStudents() {
  const client = useQueryClient();
  return useMutation<void, ApiError, ConnectStudentsPayload>({
    mutationFn: (payload) => connectStudentsToGroup(payload),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      void client.invalidateQueries({
        queryKey: [...QUERY_KEYS.groups, QUERY_KEYS.detail, variables.appointmentId],
      });
      void client.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}

export function useStudentsOption(levelId?: string, gradeId?: string, search?: string) {
  return useQuery<StudentOption[], ApiError>({
    queryKey: [...QUERY_KEYS.groups, QUERY_KEYS.options, 'students', levelId, gradeId, search],
    queryFn: ({ signal }) => fetchStudentsOption(gradeId, search, signal),
    enabled: Boolean(levelId && gradeId),
  });
}

export function useGroupOptions(kind: 'levels' | 'grades' | 'subjects', parentId?: string) {
  const { i18n } = useTranslation();
  return useQuery<GroupOptionItem[], ApiError>({
    queryKey: [...QUERY_KEYS.groups, QUERY_KEYS.options, kind, i18n.language, parentId],
    queryFn: ({ signal }) => fetchGroupOptions(kind, parentId, signal),
    enabled: kind !== 'grades' || Boolean(parentId),
  });
}
