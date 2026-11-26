import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { PaginatedResult } from '@/shared/types';
import {
  fetchAppointments,
  fetchAppointment,
  fetchAppointmentOptions,
  fetchAppointmentTeachers,
  fetchAppointmentGrades,
} from './appointments.queries.api';
import type { AppointmentDto, AppointmentFilters } from '../types';
import { OPTIONS_PAGE_SIZE } from '../constants';

export function useAppointments(filters: AppointmentFilters, calendar = false, enabled = true) {
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
    enabled,
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

export function useAppointmentGrades(levelId: string) {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: [...QUERY_KEYS.appointments, QUERY_KEYS.options, 'grades', i18n.language, levelId],
    queryFn: ({ signal }) => fetchAppointmentGrades(levelId, signal),
    enabled: Boolean(levelId),
  });
}
