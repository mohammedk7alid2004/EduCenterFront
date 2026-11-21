import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchGroups,
  fetchGroup,
  deleteGroups,
  connectStudentsToGroup,
  fetchStudentsOption,
  fetchGroupOptions,
  type GroupOptionItem,
} from './groups.api';
import type { GroupDto, GroupFilters, ConnectStudentsPayload, StudentOption } from './groups.types';

export function useGroups(filters: GroupFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<GroupDto>, ApiError>({
    queryKey: [...QUERY_KEYS.groups, i18n.language, filters],
    queryFn: ({ signal }) => fetchGroups(filters, signal),
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

export function useStudentsOption(gradeId?: string, search?: string) {
  return useQuery<StudentOption[], ApiError>({
    queryKey: [...QUERY_KEYS.groups, QUERY_KEYS.options, 'students', gradeId, search],
    queryFn: ({ signal }) => fetchStudentsOption(gradeId, search, signal),
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
