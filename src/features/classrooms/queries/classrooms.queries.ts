import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ListFilters, PaginatedResult } from '@/shared/types';
import { fetchClassrooms, fetchClassroom } from './classrooms.queries.api';
import type { ClassroomDto } from '../types';

export function useClassrooms(filters: ListFilters, enabled = true) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<ClassroomDto>, ApiError>({
    queryKey: [...QUERY_KEYS.classrooms, i18n.language, filters],
    queryFn: ({ signal }) => fetchClassrooms(filters, signal),
    enabled,
  });
}

export function useClassroom(id?: string) {
  const { i18n } = useTranslation();
  return useQuery<ClassroomDto, ApiError>({
    queryKey: [...QUERY_KEYS.classrooms, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchClassroom(id!, signal),
    enabled: Boolean(id),
  });
}
