import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { AppointmentFilters, AppointmentValues } from '../types';
import {
  saveAppointment,
  deleteAppointments,
  setAppointmentStatus,
  exportAppointments,
} from './appointments.commands.api';

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

export function useAppointmentsExport() {
  return useMutation<Blob, ApiError, AppointmentFilters>({
    mutationFn: (filters) => exportAppointments(filters),
  });
}
