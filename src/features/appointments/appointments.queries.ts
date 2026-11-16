import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/core/api';
import {
  fetchAppointments,
  fetchAppointment,
  fetchAppointmentOptions,
  fetchAppointmentTeachers,
  fetchAppointmentGrades,
  saveAppointment,
  deleteAppointments,
  setAppointmentStatus,
} from './appointments.api';
import type { AppointmentDto, AppointmentFilters, AppointmentValues } from './appointments.types';
import { OPTIONS_PAGE_SIZE } from './appointments.constants';
export function useAppointments(filters: AppointmentFilters, calendar = false) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<AppointmentDto>, ApiError>({
    queryKey: [...QUERY_KEYS.appointments, i18n.language, filters, calendar],
    queryFn: async ({ signal }) => {
      if (!calendar) return fetchAppointments(filters, signal);
      const first = await fetchAppointments(
        { ...filters, pageNumber: 1, pageSize: OPTIONS_PAGE_SIZE },
        signal,
      );
      const items = [...first.items];
      for (let page = 2; page <= first.totalPages; page++) {
        const next = await fetchAppointments(
          { ...filters, pageNumber: page, pageSize: OPTIONS_PAGE_SIZE },
          signal,
        );
        items.push(...next.items);
      }
      return { ...first, items };
    },
  });
}
export function useAppointment(id?: string) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: [...QUERY_KEYS.appointments, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchAppointment(id!, signal),
    enabled: Boolean(id),
  });
}
export function useAppointmentOptions(kind: 'subjects' | 'classrooms' | 'levels') {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: [...QUERY_KEYS.appointments, QUERY_KEYS.options, kind, i18n.language],
    queryFn: ({ signal }) => fetchAppointmentOptions(kind, signal),
  });
}
export function useAppointmentTeachers(subjectId?: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.appointments, QUERY_KEYS.options, 'teachers', subjectId],
    queryFn: ({ signal }) => fetchAppointmentTeachers(subjectId, signal),
    enabled,
  });
}
export function useSaveAppointment(id?: string) {
  const client = useQueryClient();
  return useMutation<void, ApiError, AppointmentValues>({
    mutationFn: (values) => saveAppointment(values, id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}
export function useDeleteAppointments() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteAppointments(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}
export function useSetAppointmentStatus() {
  const client = useQueryClient();
  return useMutation<void, ApiError, { id: string; status: number }>({
    mutationFn: ({ id, status }) => setAppointmentStatus(id, status),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}

export function useAppointmentGrades(levelId: string) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: [...QUERY_KEYS.appointments, QUERY_KEYS.options, 'grades', i18n.language, levelId],
    queryFn: ({ signal }) => fetchAppointmentGrades(levelId, signal),
    enabled: Boolean(levelId),
  });
}
