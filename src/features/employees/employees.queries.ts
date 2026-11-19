import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, ListFilters, PaginatedResult } from '@/infrastructure/api';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployees,
  toggleEmployeeStatus,
} from './employees.api';
import type { EmployeeDto, EmployeeValues } from './employees.types';
export function useEmployees(filters: ListFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<EmployeeDto>, ApiError>({
    queryKey: [...QUERY_KEYS.employees, i18n.language, filters],
    queryFn: ({ signal }) => fetchEmployees(filters, signal),
  });
}
export function useEmployee(id?: string) {
  const { i18n } = useTranslation();
  return useQuery<EmployeeDto, ApiError>({
    queryKey: [...QUERY_KEYS.employees, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchEmployee(id!, signal),
    enabled: Boolean(id),
  });
}
export function useSaveEmployee(initial?: EmployeeDto) {
  const client = useQueryClient();
  const savedId = useRef(initial?.id);
  const savedStatus = useRef(initial?.isActive);
  return useMutation<void, ApiError, EmployeeValues>({
    mutationFn: async ({ isActive, ...values }) => {
      if (savedId.current) await updateEmployee(savedId.current, values);
      else {
        const created = await createEmployee(values);
        savedId.current = created.id;
        savedStatus.current = created.isActive;
      }
      if (savedStatus.current === undefined)
        savedStatus.current = (await fetchEmployee(savedId.current)).isActive;
      if (savedStatus.current !== isActive) {
        try {
          await toggleEmployeeStatus(savedId.current);
          savedStatus.current = isActive;
        } catch (error) {
          savedStatus.current = undefined;
          throw error;
        }
      }
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  });
}
export function useDeleteEmployees() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteEmployees(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  });
}
export function useToggleEmployeeStatus() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => toggleEmployeeStatus(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  });
}
