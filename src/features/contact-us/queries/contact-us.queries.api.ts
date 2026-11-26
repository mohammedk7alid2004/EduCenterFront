import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type { ContactFilters, ContactMessage } from '../types';
import { contactFilterParams } from '../utils';

const endpoints = API_ENDPOINTS.contactUs;

export async function fetchContacts(
  filters: ContactFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<ContactMessage>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<ContactMessage>>>(
      endpoints.getAll,
      { params: contactFilterParams(filters), signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchContact(id: string, signal?: AbortSignal): Promise<ContactMessage> {
  try {
    const { data } = await apiClient.get<ApiResult<ContactMessage>>(endpoints.detail(id), {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
