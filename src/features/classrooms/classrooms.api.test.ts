import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/core/api';
import {
  createClassroom,
  updateClassroom,
  fetchClassrooms,
  deleteClassrooms,
  toggleClassroomStatus,
} from './classrooms.api';
import type { ClassroomValues } from './classrooms.types';
vi.mock('@/core/api', async () => ({
  ...(await vi.importActual<typeof import('@/core/api')>('@/core/api')),
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));
const values: ClassroomValues = {
  nameAr: '����',
  nameEn: 'Hall',
  capacity: 50,
  noteAr: '������',
  noteEn: 'Note',
  isActive: false,
};
describe('classroom backend contract', () => {
  beforeEach(() => vi.clearAllMocks());
  it('preserves an empty result and sends search, paging, inactive state and cancellation', async () => {
    const data = { items: [], pageNumber: 2, totalCount: 0, totalPages: 0 };
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data } });
    const signal = new AbortController().signal;
    expect(
      await fetchClassrooms({ name: 'hall', pageNumber: 2, pageSize: 25, isActive: false }, signal),
    ).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.classrooms.getAll, {
      params: { Name: 'hall', PageNumber: 2, PageSize: 25, IsActive: false },
      signal,
    });
  });
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
