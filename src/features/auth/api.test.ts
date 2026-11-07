import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loginUser } from './api';
import { apiClient } from '@/core/api';

vi.mock('@/core/api', async () => {
  const actual = await vi.importActual<typeof import('@/core/api')>('@/core/api');
  return {
    ...actual,
    apiClient: {
      post: vi.fn(),
    },
  };
});

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully returns tokens and user on valid dashboard login', async () => {
    const mockResponse = {
      data: {
        isSuccess: true,
        statusCode: 200,
        message: 'Loginsuccessful',
        data: {
          token: 'jwt-access-token',
          tokenExpiresAt: '2026-11-08T00:00:00Z',
          refreshToken: 'jwt-refresh-token',
          refreshTokenExpiresAt: '2026-11-15T00:00:00Z',
          userId: 'user-123',
          fullName: 'Mahmoud Alaa',
          role: 'admin',
          permissions: ['*'],
        },
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

    const result = await loginUser({
      email: 'mahmoud@gmail.com',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('jwt-access-token');
    expect(result.refreshToken).toBe('jwt-refresh-token');
    expect(result.user.id).toBe('user-123');
    expect(result.user.name).toBe('Mahmoud Alaa');
    expect(result.user.roles).toContain('admin');
  });

  it('throws ApiError when isSuccess is false', async () => {
    const mockResponse = {
      data: {
        isSuccess: false,
        statusCode: 400,
        message: 'InvalidCredentials',
        data: null,
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

    await expect(loginUser({ email: 'bad@gmail.com', password: 'wrong' })).rejects.toThrow();
  });
});
