import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { PaginatedResult } from '@/shared/types';
import {
  fetchAttendance,
  fetchAttendanceItem,
  fetchAttendanceStudents,
  fetchAttendanceAppointmentOptions,
  fetchRecordedAttendance,
} from './attendance.queries.api';
import type {
  AttendanceDto,
  AttendanceFilters,
  AttendanceStudentOption,
  AttendanceAppointmentOption,
  RecordedAttendance,
} from '../types';

export function useAttendance(
  filters: AttendanceFilters,
  enabled = true,
  refreshInterval?: number,
) {
  return useQuery<PaginatedResult<AttendanceDto>, ApiError>({
    queryKey: [...QUERY_KEYS.attendance, filters],
    queryFn: ({ signal }) => fetchAttendance(filters, signal),
    enabled,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: Boolean(refreshInterval),
  });
}

export function useAttendanceItem(id?: string) {
  return useQuery<AttendanceDto, ApiError>({
    queryKey: [...QUERY_KEYS.attendance, QUERY_KEYS.detail, id],
    queryFn: ({ signal }) => fetchAttendanceItem(id!, signal),
    enabled: Boolean(id),
  });
}

export function useAttendanceStudents() {
  return useQuery<AttendanceStudentOption[], ApiError>({
    queryKey: [...QUERY_KEYS.attendance, QUERY_KEYS.options, 'students'],
    queryFn: ({ signal }) => fetchAttendanceStudents(signal),
  });
}

export function useAttendanceAppointmentOptions(studentId?: string) {
  return useQuery<AttendanceAppointmentOption[], ApiError>({
    queryKey: [...QUERY_KEYS.attendance, QUERY_KEYS.options, 'appointments', studentId],
    queryFn: ({ signal }) => fetchAttendanceAppointmentOptions(studentId!, signal),
    enabled: Boolean(studentId),
  });
}

export function useRecordedAttendance(
  studentId: string,
  appointmentId: string,
  sessionDate: string,
) {
  const ready = Boolean(studentId && appointmentId && /^\d{4}-\d{2}-\d{2}$/.test(sessionDate));
  return useQuery<RecordedAttendance | null, ApiError>({
    queryKey: [...QUERY_KEYS.attendance, 'recorded', studentId, appointmentId, sessionDate],
    queryFn: ({ signal }) =>
      fetchRecordedAttendance({ studentId, appointmentId, sessionDate }, signal),
    enabled: ready,
    staleTime: 0,
    gcTime: 0,
  });
}
