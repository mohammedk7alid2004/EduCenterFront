import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchAttendance,
  fetchAttendanceItem,
  fetchAttendanceStudents,
  fetchAttendanceAppointmentOptions,
  exportAttendance,
  recordAttendance,
} from './attendance.api';
import type {
  AttendanceDto,
  AttendanceFilters,
  AttendanceStudentOption,
  AttendanceAppointmentOption,
  AttendanceValues,
} from './attendance.types';
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
export function useRecordAttendance() {
  const client = useQueryClient();
  return useMutation<void, ApiError, AttendanceValues>({
    mutationFn: (values) => recordAttendance(values),
    onSuccess: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.attendance }),
  });
}
export function useAttendanceExport() {
  return useMutation<Blob, ApiError, AttendanceFilters>({
    mutationFn: (filters) => exportAttendance(filters),
  });
}
