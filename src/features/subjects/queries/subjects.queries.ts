import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import { fetchSubject, fetchSubjects } from './subjects.queries.api';
import type { PaginatedList, SubjectDetail, SubjectDto, SubjectFilters } from '../types';

export function useSubjects(filters: SubjectFilters = {}) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedList<SubjectDto>, ApiError>({
    queryKey: [...QUERY_KEYS.subjects, i18n.language, filters],
    queryFn: ({ signal }) => fetchSubjects(filters, signal),
  });
}

export function useSubject(id: string) {
  const { i18n } = useTranslation();
  return useQuery<SubjectDetail, ApiError>({
    queryKey: [...QUERY_KEYS.subjects, i18n.language, id],
    queryFn: ({ signal }) => fetchSubject(id, signal),
    enabled: Boolean(id),
  });
}

export function useSubjectOptions(name: string) {
  const { i18n } = useTranslation();
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.subjects, QUERY_KEYS.options, i18n.language, name],
    queryFn: ({ signal, pageParam }) =>
      fetchSubjects({ name: name || undefined, pageNumber: pageParam, pageSize: 100 }, signal),
    initialPageParam: 1,
    getNextPageParam: (page) =>
      page.pageNumber < page.totalPages ? page.pageNumber + 1 : undefined,
  });
}
