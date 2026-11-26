import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import type { ContactFilters, ContactImportResult, SendContactEmailValues } from '../types';
import { contactFilterParams } from '../utils';

const endpoints = API_ENDPOINTS.contactUs;

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
      params: kind === 'export' ? contactFilterParams(filters) : undefined,
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

export async function sendContactEmail(
  values: SendContactEmailValues,
  signal?: AbortSignal,
): Promise<void> {
  const payload = new FormData();
  payload.append('email', values.email);
  payload.append('subject', values.subject);
  payload.append('message', values.message);
  if (values.file) payload.append('file', values.file);
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(endpoints.sendEmail, payload, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
