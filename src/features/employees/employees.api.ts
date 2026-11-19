import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
  type ListFilters,
} from '@/infrastructure/api';
import type { EmployeeDto, EmployeePayload } from './employees.types';
export async function fetchEmployees(
  filters: ListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<EmployeeDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<EmployeeDto>>>(
      API_ENDPOINTS.employees.getAll,
      {
        params: {
          Name: filters.name,
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
          IsActive: filters.isActive,
        },
        signal,
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchEmployee(id: string, signal?: AbortSignal): Promise<EmployeeDto> {
  try {
    const { data } = await apiClient.get<ApiResult<EmployeeDto>>(
      API_ENDPOINTS.employees.detail(id),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
function employeeForm(values: EmployeePayload, id?: string): FormData {
  const form = new FormData();
  if (id) form.append('Id', id);
  form.append('FullName', values.fullName.trim());
  form.append('Email', values.email.trim());
  form.append('RoleId', values.roleId);
  if (values.phoneNumber?.trim()) form.append('PhoneNumber', values.phoneNumber.trim());
  if (values.gender) form.append('Gender', values.gender);
  if (values.password) {
    form.append('Password', values.password);
    form.append('ConfirmPassword', values.password);
  }
  return form;
}
export async function createEmployee(
  values: EmployeePayload,
  signal?: AbortSignal,
): Promise<EmployeeDto> {
  try {
    const { data } = await apiClient.post<ApiResult<EmployeeDto>>(
      API_ENDPOINTS.employees.create,
      employeeForm(values),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function updateEmployee(
  id: string,
  values: EmployeePayload,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiResult<boolean>>(
      API_ENDPOINTS.employees.update,
      employeeForm(values, id),
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function deleteEmployees(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<boolean>>(API_ENDPOINTS.employees.delete, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function toggleEmployeeStatus(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<boolean>>(
      API_ENDPOINTS.employees.toggleStatus(id),
      null,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
