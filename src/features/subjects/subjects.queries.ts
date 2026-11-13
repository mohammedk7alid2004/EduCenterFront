import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError } from '@/core/api';
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
  return useQuery<PaginatedList<SubjectDto>, ApiError>({
    queryKey: [...QUERY_KEYS.subjects, filters],
    queryFn: ({ signal }) => fetchSubjects(filters, signal),
  });
}

export function useSubject(id: string) {
  return useQuery<SubjectDetail, ApiError>({
    queryKey: [...QUERY_KEYS.subjects, id],
    queryFn: ({ signal }) => fetchSubject(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, CreateSubjectPayload>({
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
