import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import { fetchTeacher, fetchTeachers } from './teachers.queries.api';
import type { PaginatedList, TeacherDto, TeacherFilters } from '../types';

export function useTeachers(filters: TeacherFilters = {}, enabled = true) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedList<TeacherDto>, ApiError>({
    queryKey: [...QUERY_KEYS.teachers, i18n.language, filters],
    queryFn: ({ signal }) => fetchTeachers(filters, signal),
    enabled,
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
