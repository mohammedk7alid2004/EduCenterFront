import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError } from '@/infrastructure/api';
import {
  createSubject,
  deleteSubjects,
  fetchSubject,
  fetchSubjects,
  toggleSubjectStatus,
  updateSubject,
} from './subjects.api';
import type {
  CreateSubjectPayload,
  DeleteSubjectsPayload,
  PaginatedList,
  SubjectDetail,
  SubjectDto,
  SubjectFilters,
  UpdateSubjectPayload,
} from './subjects.types';

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

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation<string, ApiError, CreateSubjectPayload>({
    mutationFn: (payload) => createSubject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, UpdateSubjectPayload>({
    mutationFn: (payload) => updateSubject(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
    },
  });
}

export function useDeleteSubjects() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, DeleteSubjectsPayload>({
    mutationFn: (payload) => deleteSubjects(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
    },
  });
}

export function useToggleSubjectStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => toggleSubjectStatus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
    },
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

export function useSaveSubject(existingId?: string) {
  const queryClient = useQueryClient();
  // Retain a newly created ID if applying its status fails so retry cannot duplicate the subject.
  const savedId = useRef(existingId);
  return useMutation<void, ApiError, CreateSubjectPayload & { isActive: boolean }>({
    mutationFn: async ({ isActive, ...payload }) => {
      if (savedId.current) await updateSubject({ ...payload, id: savedId.current });
      else savedId.current = await createSubject(payload);
      const current = await fetchSubject(savedId.current);
      if (current.isActive !== isActive) await toggleSubjectStatus(savedId.current);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
    },
  });
}
