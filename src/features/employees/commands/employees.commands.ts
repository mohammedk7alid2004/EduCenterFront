import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { EmployeeDto, EmployeeFilters, EmployeeImportResult, EmployeeValues } from '../types';
import {
  createEmployee,
  updateEmployee,
  deleteEmployees,
  toggleEmployeeStatus,
  exportEmployees,
  fetchEmployeeTemplate,
  importEmployees,
} from './employees.commands.api';
import { fetchEmployee } from '../queries';

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

export function useEmployeesExport() {
  return useMutation<Blob, ApiError, EmployeeFilters>({
    mutationFn: (filters) => exportEmployees(filters),
  });
}

export function useEmployeeTemplate() {
  return useMutation<Blob, ApiError, void>({
    mutationFn: () => fetchEmployeeTemplate(),
  });
}

export function useImportEmployees() {
  const client = useQueryClient();
  return useMutation<EmployeeImportResult, ApiError, File>({
    mutationFn: (file) => importEmployees(file),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  });
}
