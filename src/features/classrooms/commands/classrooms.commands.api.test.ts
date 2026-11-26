import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import {
  createClassroom,
  updateClassroom,
  deleteClassrooms,
  toggleClassroomStatus,
} from './classrooms.commands.api';
import type { ClassroomValues } from '../types';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

const values: ClassroomValues = {
  nameAr: 'قاعة',
  nameEn: 'Hall',
  capacity: 50,
  noteAr: 'ملاحظة',
  noteEn: 'Note',
  isActive: false,
};

describe('classroom command API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves capacity, both languages and inactive state in the create request', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { isSuccess: true, data: 'created-id' } });
    const signal = new AbortController().signal;
    expect(await createClassroom(values, signal)).toBe('created-id');
    expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.classrooms.create, values, {
      signal,
    });
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('sends the existing id and preserves localized values during update', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true, data: true } });
    await updateClassroom('existing-id', values);
    expect(apiClient.put).toHaveBeenCalledWith(
      API_ENDPOINTS.classrooms.update,
      { id: 'existing-id', ...values },
      { signal: undefined },
    );
  });

  it('uses a DELETE JSON body for bulk deletion and PATCH for status', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { isSuccess: true, data: true } });
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { isSuccess: true, data: true } });
    const signal = new AbortController().signal;
    await deleteClassrooms(['one', 'two'], signal);
    expect(apiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.classrooms.delete, {
      data: { ids: ['one', 'two'] },
      signal,
    });
    await toggleClassroomStatus('one', signal);
    expect(apiClient.patch).toHaveBeenCalledWith(
      API_ENDPOINTS.classrooms.toggleStatus('one'),
      null,
      { signal },
    );
  });

  it('rejects unsuccessful envelopes even when HTTP succeeds', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { isSuccess: false, statusCode: 400, message: 'Classroom already exists' },
    });
    await expect(createClassroom(values)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Classroom already exists',
    });
  });
});
