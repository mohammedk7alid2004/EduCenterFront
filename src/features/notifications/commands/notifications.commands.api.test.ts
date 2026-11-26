import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/shared/api';
import {
  createNotification,
  resendNotification,
  updateNotification,
} from './notifications.commands.api';
import { NOTIFICATION_TYPE } from '../constants';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('notifications command API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends multipart form data on create and update and posts resend', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { isSuccess: true, data: 'id-1' } });
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { isSuccess: true, data: true } });

    await createNotification({
      title: 'Exam',
      type: NOTIFICATION_TYPE.students,
      groupId: 'g-1',
      levelId: '',
      gradeId: '',
      message: 'Tomorrow at 5 PM',
      image: null,
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/v1/Notifications/Create',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
    );

    await updateNotification('n-1', {
      title: 'Exam Updated',
      type: NOTIFICATION_TYPE.teachers,
      groupId: '',
      levelId: 'l-1',
      gradeId: 'gr-1',
      message: 'Updated message',
      image: null,
      removeImage: true,
    });
    const putPayload = vi.mocked(apiClient.put).mock.calls[0][1] as FormData;
    expect(putPayload.get('id')).toBe('n-1');
    expect(putPayload.get('removeImage')).toBe('true');

    await resendNotification('n-1');
    expect(apiClient.post).toHaveBeenLastCalledWith('/v1/Notifications/Resend/n-1', null, {
      signal: undefined,
    });
  });

  it('rejects unsuccessful envelopes with ApiError', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: false, statusCode: 400, message: 'Notification title is required.' },
    });
    await expect(
      createNotification({
        title: '',
        type: NOTIFICATION_TYPE.students,
        groupId: '',
        levelId: '',
        gradeId: '',
        message: 'Body',
        image: null,
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Notification title is required.',
    } satisfies Partial<ApiError>);
  });
});
