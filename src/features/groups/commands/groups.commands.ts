import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { GroupFilters, ConnectStudentsPayload } from '../types';
import { deleteGroups, exportGroups, connectStudentsToGroup } from './groups.commands.api';

export function useDeleteGroups() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteGroups(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      void client.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  });
}

export function useGroupsExport() {
  return useMutation<Blob, ApiError, GroupFilters>({
    mutationFn: (filters) => exportGroups(filters),
  });
}

export function useConnectStudents() {
  const client = useQueryClient();
  return useMutation<void, ApiError, ConnectStudentsPayload>({
    mutationFn: (payload) => connectStudentsToGroup(payload),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.groups });
      void client.invalidateQueries({
        queryKey: [...QUERY_KEYS.groups, QUERY_KEYS.detail, variables.appointmentId],
      });
      void client.invalidateQueries({ queryKey: QUERY_KEYS.students });
    },
  });
}
