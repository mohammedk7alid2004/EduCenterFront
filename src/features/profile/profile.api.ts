import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
} from '@/infrastructure/api';
import type { ProfileDto, ProfileValues, ChangePasswordValues } from './profile.types';

export async function fetchProfile(signal?: AbortSignal): Promise<ProfileDto> {
  try {
    const { data } = await apiClient.get<ApiResult<ProfileDto>>(API_ENDPOINTS.auth.profile, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
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
