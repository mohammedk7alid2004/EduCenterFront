import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/infrastructure/api';
import { changePassword, fetchProfile, updateProfile } from './profile.api';
vi.mock('@/infrastructure/api', async () => ({
  ...(await vi.importActual<typeof import('@/infrastructure/api')>('@/infrastructure/api')),
  apiClient: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));
describe('profile API contracts', () => {
  beforeEach(() => vi.clearAllMocks());
  it('sends only editable profile fields and the image with cancellation', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: true } });
    const image = new File(['image'], 'avatar.png', { type: 'image/png' });
    const values = {
      fullName: ' Name ',
      phoneNumber: ' +201012345678 ',
      image,
      email: 'must-not-be-sent@example.com',
    };
    const signal = new AbortController().signal;
    await updateProfile(values, signal);
    const [endpoint, payload, config] = vi.mocked(apiClient.put).mock.calls[0];
    const form = payload as FormData;
    expect(endpoint).toBe(API_ENDPOINTS.auth.updateProfile);
    expect(form.get('FullName')).toBe('Name');
    expect(form.get('PhoneNumber')).toBe('+201012345678');
    expect(form.get('Image')).toBe(image);
    expect([...form.keys()]).toEqual(['FullName', 'PhoneNumber', 'Image']);
    expect(config).toEqual({ signal });
  });
  it('does not send an absent phone or image as an empty replacement', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: true } });
    await updateProfile({ fullName: 'Name', phoneNumber: '' });
    expect([...(vi.mocked(apiClient.put).mock.calls[0][1] as FormData).keys()]).toEqual([
      'FullName',
    ]);
  });
  it('loads the authenticated profile without a user id parameter', async () => {
    const data = { id: 'user-id', fullName: 'Name', email: 'name@example.com' };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data } });
    const signal = new AbortController().signal;
    expect(await fetchProfile(signal)).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.auth.profile, { signal });
  });
  it('sends the current password and confirmation, and rejects backend failures', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { isSuccess: false, statusCode: 400, message: 'Incorrect current password' },
    });
    const values = {
      currentPassword: 'Old123!',
      newPassword: 'New12345!',
      confirmPassword: 'New12345!',
    };
    const signal = new AbortController().signal;
    await expect(changePassword(values, signal)).rejects.toMatchObject({
      message: 'Incorrect current password',
    });
    expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.changePassword, values, {
      signal,
    });
  });
});
