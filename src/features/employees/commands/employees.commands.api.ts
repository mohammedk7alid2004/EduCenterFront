import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { EmployeeDto, EmployeePayload } from '../types';

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
