import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/infrastructure/api';
import { requestPasswordReset, resetPassword, verifyResetOtp } from './password-recovery.api';

vi.mock('@/infrastructure/api', async () => {
  const actual =
    await vi.importActual<typeof import('@/infrastructure/api')>('@/infrastructure/api');
  return { ...actual, apiClient: { post: vi.fn() } };
});

describe('password recovery API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits a trimmed email when requesting a reset code', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: true, message: '', statusCode: 200, data: true },
    });

    await requestPasswordReset({ email: '  teacher@example.com  ' });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/Auth/forgot-password',
      { email: 'teacher@example.com' },
      { signal: undefined },
    );
  });

  it('returns the reset token after a valid OTP', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: true, message: '', statusCode: 200, data: 'reset-token' },
    });

    await expect(verifyResetOtp({ email: 'teacher@example.com', otp: '123456' })).resolves.toBe(
      'reset-token',
    );
  });

  it('sends the verified token with the new password', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: true, message: '', statusCode: 200, data: true },
    });

    await resetPassword({
      email: 'teacher@example.com',
      token: 'reset-token',
      newPassword: 'Aa1!secure',
      confirmPassword: 'Aa1!secure',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/Auth/reset-password',
      {
        email: 'teacher@example.com',
        token: 'reset-token',
        newPassword: 'Aa1!secure',
        confirmPassword: 'Aa1!secure',
      },
      { signal: undefined },
    );
  });
});
