import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { PaginatedResult } from '@/shared/types';
import { fetchStudents, fetchStudent, fetchStudentEducation } from './students.queries.api';
import type { StudentDto, StudentFilters, StudentOption } from '../types';

export function useStudents(filters: StudentFilters, enabled = true) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<StudentDto>, ApiError>({
    queryKey: [...QUERY_KEYS.students, i18n.language, filters],
    queryFn: ({ signal }) => fetchStudents(filters, signal),
    enabled,
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
