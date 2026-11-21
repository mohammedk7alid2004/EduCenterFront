import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchAttendance,
  fetchAttendanceItem,
  fetchAttendanceStudents,
  recordAttendance,
} from './attendance.api';
import type {
  AttendanceDto,
  AttendanceFilters,
  AttendanceStudentOption,
  AttendanceValues,
} from './attendance.types';
export function useAttendance(filters: AttendanceFilters, enabled = true) {
  return useQuery<PaginatedResult<AttendanceDto>, ApiError>({
    queryKey: [...QUERY_KEYS.attendance, filters],
    queryFn: ({ signal }) => fetchAttendance(filters, signal),
    enabled,
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
export function useRecordAttendance() {
  const client = useQueryClient();
  return useMutation<void, ApiError, AttendanceValues>({
    mutationFn: (values) => recordAttendance(values),
    onSuccess: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.attendance }),
  });
}
