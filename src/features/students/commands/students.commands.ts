import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { StudentFilters, StudentValues, StudentImportResult } from '../types';
import {
  saveStudent,
  deleteStudents,
  toggleStudentStatus,
  exportStudents,
  fetchStudentTemplate,
  importStudents,
} from './students.commands.api';

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

export function useStudentsExport() {
  return useMutation<Blob, ApiError, StudentFilters>({
    mutationFn: (filters) => exportStudents(filters),
  });
}

export function useStudentTemplate() {
  return useMutation<Blob, ApiError, void>({
    mutationFn: () => fetchStudentTemplate(),
  });
}

export function useImportStudents() {
  const client = useQueryClient();
  return useMutation<StudentImportResult, ApiError, File>({
    mutationFn: (file) => importStudents(file),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}
