import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type {
  CreateTeacherPayload,
  DeleteTeachersPayload,
  TeacherFilters,
  UpdateTeacherPayload,
} from '../types';
import {
  createTeacher,
  deleteTeachers,
  toggleTeacherStatus,
  exportTeachers,
  updateTeacher,
} from './teachers.commands.api';

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

export function useTeachersExport() {
  return useMutation<Blob, ApiError, TeacherFilters>({
    mutationFn: (filters) => exportTeachers(filters),
  });
}
