import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import { changePassword, updateProfile } from './profile.commands.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { put: vi.fn(), post: vi.fn() },
}));

describe('profile command API contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends only editable profile fields and the image with cancellation', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: true } });
    const image = new File(['image'], 'avatar.png', { type: 'image/png' });
    const values = {
      fullName: ' Name ',
      phoneNumber: ' +201012345678 ',
      gender: 'Male',
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
    expect(form.get('Gender')).toBe('Male');
    expect([...form.keys()]).toEqual(['FullName', 'PhoneNumber', 'Gender', 'Image']);
    expect(config).toEqual({ signal });
  });

  it('does not send an absent phone or image as an empty replacement', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: true } });
    await updateProfile({ fullName: 'Name', phoneNumber: '', gender: 'Female' });
    expect([...(vi.mocked(apiClient.put).mock.calls[0][1] as FormData).keys()]).toEqual([
      'FullName',
      'Gender',
    ]);
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
