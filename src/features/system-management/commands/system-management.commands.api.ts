import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult } from '@/shared/types';
import { FAQ_ENDPOINTS, LOGO_FIELDS, SYSTEM_TABS } from '../constants';
import type {
  CenterSettings,
  CenterValues,
  ContentValues,
  FaqDto,
  FaqValues,
  SocialLink,
} from '../types';

export async function saveSettings(
  endpoint: string,
  values: ContentValues | { links: SocialLink[] },
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.put<ApiResult<unknown>>(endpoint, values, { signal });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function centerFormData(values: CenterValues): FormData {
  const form = new FormData();
  for (const key of [
    'centerNameAr',
    'centerNameEn',
    'workingHoursAr',
    'workingHoursEn',
    'mainPhoneNumber',
  ] as const)
    form.append(key, values[key]);
  values.othersPhoneNumbers.forEach((phone, index) =>
    form.append(`OthersPhoneNumbers[${index}]`, phone),
  );
  // An explicit empty entry lets the backend clear the collection rather than preserve it.
  if (!values.othersPhoneNumbers.length) form.append('ClearOtherPhoneNumbers', 'true');
  if (!values.locations.length) form.append('ClearLocations', 'true');
  values.locations.forEach((location, index) => {
    form.append(`Locations[${index}].Location`, location.location ?? '');
    if (location.lat !== null) form.append(`Locations[${index}].Lat`, String(location.lat));
    if (location.long !== null) form.append(`Locations[${index}].Long`, String(location.long));
  });
  LOGO_FIELDS.forEach((key) => {
    if (values[key]) form.append(key, values[key]);
  });
  return form;
}

export async function saveCenter(
  values: CenterValues,
  signal?: AbortSignal,
): Promise<CenterSettings> {
  try {
    const { data } = await apiClient.put<ApiResult<CenterSettings>>(
      SYSTEM_TABS[7].endpoint,
      centerFormData(values),
      { signal },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function saveFaq(
  id: string | undefined,
  values: FaqValues,
  signal?: AbortSignal,
): Promise<FaqDto> {
  try {
    const payload = {
      questionAr: values.questionAr.trim() || (id ? undefined : ''),
      questionEn: values.questionEn.trim() || (id ? undefined : ''),
      answerAr: values.answerAr.trim(),
      answerEn: values.answerEn.trim(),
    };
    const { data } = id
      ? await apiClient.put<ApiResult<FaqDto>>(FAQ_ENDPOINTS.detail(id), payload, { signal })
      : await apiClient.post<ApiResult<FaqDto>>(FAQ_ENDPOINTS.base, payload, { signal });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function toggleFaq(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.patch<ApiResult<unknown>>(FAQ_ENDPOINTS.status(id), null, {
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteFaqs(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<unknown>>(FAQ_ENDPOINTS.base, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
