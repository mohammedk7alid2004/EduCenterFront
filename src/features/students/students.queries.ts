import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchStudents,
  fetchStudent,
  saveStudent,
  deleteStudents,
  toggleStudentStatus,
  fetchStudentEducation,
} from './students.api';
import type { StudentDto, StudentFilters, StudentValues, StudentOption } from './students.types';
export function useStudents(filters: StudentFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<StudentDto>, ApiError>({
    queryKey: [...QUERY_KEYS.students, i18n.language, filters],
    queryFn: ({ signal }) => fetchStudents(filters, signal),
  });
}
export function useStudent(id?: string) {
  const { i18n } = useTranslation();
  return useQuery<StudentDto, ApiError>({
    queryKey: [...QUERY_KEYS.students, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchStudent(id!, signal),
    enabled: Boolean(id),
  });
}
export function useStudentEducation(kind: 'levels' | 'grades', levelId?: string) {
  const { i18n } = useTranslation();
  return useQuery<StudentOption[], ApiError>({
    queryKey: [...QUERY_KEYS.students, QUERY_KEYS.options, kind, i18n.language, levelId],
    queryFn: ({ signal }) => fetchStudentEducation(kind, levelId, signal),
    enabled: kind === 'levels' || Boolean(levelId),
  });
}
export function useSaveStudent(id?: string) {
  const client = useQueryClient();
  return useMutation<void, ApiError, StudentValues>({
    mutationFn: (values) => saveStudent(values, id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}
export function useDeleteStudents() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteStudents(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}
export function useToggleStudentStatus() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => toggleStudentStatus(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}
