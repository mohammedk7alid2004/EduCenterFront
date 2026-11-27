import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ExcelImportResult, ListFilters } from '@/shared/types';
import type { ClassroomValues } from '../types';
import {
  createClassroom,
  updateClassroom,
  deleteClassrooms,
  toggleClassroomStatus,
  exportClassrooms,
  fetchClassroomTemplate,
  importClassrooms,
} from './classrooms.commands.api';

export function useSaveClassroom(id?: string) {
  const client = useQueryClient();
  return useMutation<void, ApiError, ClassroomValues>({
    mutationFn: async (values) => {
      if (id) await updateClassroom(id, values);
      else await createClassroom(values);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.classrooms });
    },
  });
}

export function useDeleteClassrooms() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteClassrooms(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.classrooms });
    },
  });
}

export function useToggleClassroomStatus() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => toggleClassroomStatus(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.classrooms });
    },
  });
}

export function useClassroomsExport() {
  return useMutation<Blob, ApiError, ListFilters>({
    mutationFn: (filters) => exportClassrooms(filters),
  });
}

export function useClassroomTemplate() {
  return useMutation<Blob, ApiError, void>({
    mutationFn: () => fetchClassroomTemplate(),
  });
}

export function useImportClassrooms() {
  const client = useQueryClient();
  return useMutation<ExcelImportResult, ApiError, File>({
    mutationFn: (file) => importClassrooms(file),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.classrooms });
    },
  });
}
