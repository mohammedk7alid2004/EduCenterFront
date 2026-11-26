import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { ProfileValues, ChangePasswordValues } from '../types';

export async function updateProfile(values: ProfileValues, signal?: AbortSignal): Promise<void> {
  const form = new FormData();
  form.append('FullName', values.fullName.trim());
  if (values.phoneNumber.trim()) form.append('PhoneNumber', values.phoneNumber.trim());
  form.append('Gender', values.gender);
  if (values.image) form.append('Image', values.image);
  try {
    const { data } = await apiClient.put<ApiResult<boolean>>(
      API_ENDPOINTS.auth.updateProfile,
      form,
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function changePassword(
  values: ChangePasswordValues,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(
      API_ENDPOINTS.auth.changePassword,
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
      { signal },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
