import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, ListFilters, PaginatedResult } from '@/infrastructure/api';
import {
  fetchClassrooms,
  fetchClassroom,
  createClassroom,
  updateClassroom,
  deleteClassrooms,
  toggleClassroomStatus,
} from './classrooms.api';
import type { ClassroomDto, ClassroomValues } from './classrooms.types';
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
