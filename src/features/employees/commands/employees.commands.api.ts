import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { EmployeeDto, EmployeeFilters, EmployeeImportResult, EmployeePayload } from '../types';

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

export async function exportEmployees(
  filters: EmployeeFilters = {},
  signal?: AbortSignal,
): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.employees.export, {
      responseType: 'blob',
      signal,
      params: {
        Search: filters.name,
        IsActive: filters.isActive,
        RoleId: filters.roleId,
      },
    });
    if (data.type.includes('json')) {
      const result: ApiResult<unknown> = JSON.parse(await data.text());
      assertApiSuccess(result);
      throw new Error('errors.unknown');
    }
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchEmployeeTemplate(signal?: AbortSignal): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(API_ENDPOINTS.employees.template, {
      responseType: 'blob',
      signal,
    });
    if (data.type.includes('json')) {
      const result: ApiResult<unknown> = JSON.parse(await data.text());
      assertApiSuccess(result);
      throw new Error('errors.unknown');
    }
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function importEmployees(
  file: File,
  signal?: AbortSignal,
): Promise<EmployeeImportResult> {
  const payload = new FormData();
  payload.append('file', file);
  try {
    const { data } = await apiClient.post<ApiResult<EmployeeImportResult>>(
      API_ENDPOINTS.employees.import,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
