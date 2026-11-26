import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { ProfileDto } from '../types';

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
