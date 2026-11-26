import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { AttendanceDto, AttendanceFilters, AttendanceValues } from '../types';
import { exportAttendance, recordAttendance } from './attendance.commands.api';
import { fetchAllAttendanceForExport } from '../queries';

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

export function useAttendancePdfExport() {
  return useMutation<AttendanceDto[], ApiError, AttendanceFilters>({
    mutationFn: (filters) => fetchAllAttendanceForExport(filters),
  });
}
