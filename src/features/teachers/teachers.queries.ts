import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError } from '@/core/api';
import {
  createTeacher,
  deleteTeachers,
  fetchTeacher,
  fetchTeachers,
  toggleTeacherStatus,
  updateTeacher,
} from './teachers.api';
import type {
  CreateTeacherPayload,
  DeleteTeachersPayload,
  PaginatedList,
  TeacherDto,
  TeacherFilters,
  UpdateTeacherPayload,
} from './teachers.types';

export function useTeachers(filters: TeacherFilters = {}) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedList<TeacherDto>, ApiError>({
    queryKey: [...QUERY_KEYS.teachers, i18n.language, filters],
    queryFn: ({ signal }) => fetchTeachers(filters, signal),
  });
}

export function useTeacher(id: string) {
  const { i18n } = useTranslation();
  return useQuery<TeacherDto, ApiError>({
    queryKey: [...QUERY_KEYS.teachers, i18n.language, id],
    queryFn: ({ signal }) => fetchTeacher(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, CreateTeacherPayload>({
    mutationFn: (payload) => createTeacher(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, UpdateTeacherPayload>({
    mutationFn: (payload) => updateTeacher(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
    },
  });
}

export function useDeleteTeachers() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, DeleteTeachersPayload>({
    mutationFn: (payload) => deleteTeachers(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
    },
  });
}

export function useToggleTeacherStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => toggleTeacherStatus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teachers });
    },
  });
}
