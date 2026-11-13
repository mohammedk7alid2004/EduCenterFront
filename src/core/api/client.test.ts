import { afterEach, describe, expect, it } from 'vitest';
import { apiClient } from './client';
import { setLanguage } from '@/core/i18n';
const originalAdapter = apiClient.defaults.adapter;
afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
  setLanguage('en');
});
describe('backend localization', () => {
  it('sends the current language on each request without requiring a reload', async () => {
    const languages: unknown[] = [];
    apiClient.defaults.adapter = async (config) => {
      languages.push(config.headers['Accept-Language']);
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    setLanguage('ar');
    await apiClient.get('/locale-check');
    setLanguage('en');
    await apiClient.get('/locale-check');
    expect(languages).toEqual(['ar', 'en']);
  });
});
