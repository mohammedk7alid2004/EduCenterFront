import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
} from '@/core/api';
import type { ContactFilters, ContactMessage, ContactImportResult } from './contact-us.types';
const endpoints = API_ENDPOINTS.contactUs;
function params(filters: ContactFilters) {
  return {
    Name: filters.name,
    Email: filters.email,
    Phone: filters.phone,
    Subject: filters.subject,
    PageNumber: filters.pageNumber,
    PageSize: filters.pageSize,
  };
}
export async function fetchContacts(
  filters: ContactFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<ContactMessage>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<ContactMessage>>>(
      endpoints.getAll,
      { params: params(filters), signal },
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
export async function deleteContacts(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<boolean>>(endpoints.delete, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function fetchContactFile(
  kind: 'export' | 'template',
  filters: ContactFilters,
  signal?: AbortSignal,
): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(endpoints[kind], {
      responseType: 'blob',
      params: kind === 'export' ? params(filters) : undefined,
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
export async function importContacts(
  file: File,
  signal?: AbortSignal,
): Promise<ContactImportResult> {
  const payload = new FormData();
  payload.append('file', file);
  try {
    const { data } = await apiClient.post<ApiResult<ContactImportResult>>(
      endpoints.import,
      payload,
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
