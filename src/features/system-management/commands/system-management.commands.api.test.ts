import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api';
import {
  centerFormData,
  deleteFaqs,
  saveFaq,
  saveSettings,
  toggleFaq,
} from './system-management.commands.api';
import { FAQ_ENDPOINTS, SYSTEM_TABS } from '../constants';
import type { CenterValues } from '../types';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('system management command API contracts', () => {
  beforeEach(() => vi.clearAllMocks());

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

  it('bulk deletes with a JSON body', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { isSuccess: true, data: true } });
    await deleteFaqs(['one', 'two']);
    expect(apiClient.delete).toHaveBeenCalledWith(FAQ_ENDPOINTS.base, {
      data: { ids: ['one', 'two'] },
      signal: undefined,
    });
  });
});
