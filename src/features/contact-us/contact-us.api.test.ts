import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/infrastructure/api';
import { sendContactEmail } from './contact-us.api';

vi.mock('@/infrastructure/api', async () => ({
  ...(await vi.importActual<typeof import('@/infrastructure/api')>('@/infrastructure/api')),
  apiClient: { post: vi.fn() },
}));

describe('contact-us send email API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('posts multipart form data to ContactUs SendEmail endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { isSuccess: true, data: true } });
    const file = new File(['hello'], 'reply.pdf', { type: 'application/pdf' });

    await sendContactEmail({
      email: 'student@example.com',
      subject: 'Reply',
      message: 'We received your request.',
      file,
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/v1/ContactUs/SendEmail',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
    );
    const payload = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
    expect(payload.get('email')).toBe('student@example.com');
    expect(payload.get('subject')).toBe('Reply');
    expect(payload.get('message')).toBe('We received your request.');
    expect(payload.get('file')).toBe(file);
  });

  it('rejects unsuccessful envelopes with ApiError', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: false, statusCode: 500, message: 'Failed to send email' },
    });

    await expect(
      sendContactEmail({
        email: 'student@example.com',
        subject: 'Reply',
        message: 'Body',
        file: null,
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Failed to send email',
    } satisfies Partial<ApiError>);
  });
});
