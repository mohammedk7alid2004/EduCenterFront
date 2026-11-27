import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ExcelImportResult } from '@/shared/types';
import type {
  CreateSubjectPayload,
  DeleteSubjectsPayload,
  SubjectFilters,
  UpdateSubjectPayload,
} from '../types';
import {
  createSubject,
  deleteSubjects,
  toggleSubjectStatus,
  exportSubjects,
  fetchSubjectTemplate,
  importSubjects,
  updateSubject,
} from './subjects.commands.api';
import { fetchSubject } from '../queries';

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

export function useSubjectsExport() {
  return useMutation<Blob, ApiError, SubjectFilters>({
    mutationFn: (filters) => exportSubjects(filters),
  });
}

export function useSubjectTemplate() {
  return useMutation<Blob, ApiError, void>({
    mutationFn: () => fetchSubjectTemplate(),
  });
}

export function useImportSubjects() {
  const queryClient = useQueryClient();
  return useMutation<ExcelImportResult, ApiError, File>({
    mutationFn: (file) => importSubjects(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
    },
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
