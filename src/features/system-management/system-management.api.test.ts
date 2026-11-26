import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/infrastructure/api';
import {
  centerFormData,
  deleteFaqs,
  fetchFaqs,
  fetchSettings,
  saveFaq,
  saveSettings,
  toggleFaq,
} from './system-management.api';
import { FAQ_ENDPOINTS, SYSTEM_TABS } from './system-management.constants';
import type { CenterValues } from './system-management.types';
vi.mock('@/infrastructure/api', async () => ({
  ...(await vi.importActual<typeof import('@/infrastructure/api')>('@/infrastructure/api')),
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
describe('system management backend contracts', () => {
  beforeEach(() => vi.clearAllMocks());
  it('uses the admin endpoint, cancellation and the real empty response', async () => {
    const result = { items: [], totalCount: 0, totalPages: 0, pageNumber: 2 };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data: result } });
    const signal = new AbortController().signal;
    expect(
      await fetchFaqs({ pageNumber: 2, pageSize: 25, name: 'query', isActive: false }, signal),
    ).toEqual(result);
    expect(apiClient.get).toHaveBeenCalledWith(FAQ_ENDPOINTS.base, {
      params: { PageNumber: 2, PageSize: 25, Name: 'query', IsActive: false },
      signal,
    });
  });
  it('preserves both content languages and does not send social contact fields from the links editor', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: {} } });
    await saveSettings(SYSTEM_TABS[0].endpoint, {
      descriptionAr: 'عربي',
      descriptionEn: 'English',
    });
    expect(apiClient.put).toHaveBeenLastCalledWith(
      SYSTEM_TABS[0].endpoint,
      { descriptionAr: 'عربي', descriptionEn: 'English' },
      { signal: undefined },
    );
    await saveSettings(SYSTEM_TABS[3].endpoint, { links: [{ platformName: 'Twitter', url: '' }] });
    expect(apiClient.put).toHaveBeenLastCalledWith(
      SYSTEM_TABS[3].endpoint,
      { links: [{ platformName: 'Twitter', url: '' }] },
      { signal: undefined },
    );
  });
  it('serializes all locations and files and explicitly clears empty collections', () => {
    const values: CenterValues = {
      lateMinutes: 15,
      absentMinutes: 30,
      centerNameAr: 'مركز',
      centerNameEn: 'Center',
      workingHoursAr: '',
      workingHoursEn: '12 hours',
      mainPhoneNumber: '',
      othersPhoneNumbers: [],
      locations: [],
      invoiceLogo: new File(['png'], 'logo.png', { type: 'image/png' }),
    };
    const empty = centerFormData(values);
    expect(empty.get('ClearOtherPhoneNumbers')).toBe('true');
    expect(empty.get('ClearLocations')).toBe('true');
    expect(empty.get('invoiceLogo')).toBeInstanceOf(File);
    expect(empty.get('LateMinutes')).toBe('15');
    expect(empty.get('AbsentMinutes')).toBe('30');
    const multiple = centerFormData({
      ...values,
      othersPhoneNumbers: ['01234567890'],
      locations: [
        { location: 'Address', lat: 0, long: 0 },
        { location: 'Second', lat: null, long: null },
      ],
    });
    expect(multiple.get('Locations[0].Lat')).toBe('0');
    expect(multiple.get('Locations[1].Location')).toBe('Second');
    expect(multiple.has('ClearLocations')).toBe(false);
  });
  it('keeps status on its PATCH endpoint and omits an untranslated question on edit', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: {} } });
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { isSuccess: true, data: true } });
    await saveFaq('faq', {
      questionAr: '',
      questionEn: ' Question ',
      answerAr: '',
      answerEn: 'Answer',
      isActive: false,
    });
    expect(apiClient.put).toHaveBeenCalledWith(
      FAQ_ENDPOINTS.detail('faq'),
      { questionAr: undefined, questionEn: 'Question', answerAr: '', answerEn: 'Answer' },
      { signal: undefined },
    );
    await toggleFaq('faq');
    expect(apiClient.patch).toHaveBeenCalledWith(FAQ_ENDPOINTS.status('faq'), null, {
      signal: undefined,
    });
  });
  it('bulk deletes with a JSON body and surfaces application errors', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { isSuccess: true, data: true } });
    await deleteFaqs(['one', 'two']);
    expect(apiClient.delete).toHaveBeenCalledWith(FAQ_ENDPOINTS.base, {
      data: { ids: ['one', 'two'] },
      signal: undefined,
    });
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { isSuccess: false, statusCode: 403, message: 'Denied' },
    });
    await expect(fetchSettings(SYSTEM_TABS[7].endpoint)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Denied',
    });
  });
});
