import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ListFilters, PaginatedResult } from '@/shared/types';
import { fetchEmployees, fetchEmployee } from './employees.queries.api';
import type { EmployeeDto } from '../types';

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
