import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import { fetchAppointments, fetchAppointmentTeachers } from './appointments.queries.api';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { get: vi.fn() },
}));

describe('appointment query API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses Search (not Name), reference filters, inactive state and cancellation', async () => {
    const data = { items: [], totalPages: 0, totalCount: 0, pageNumber: 2 };
    const signal = new AbortController().signal;
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data } });
    expect(
      await fetchAppointments(
        {
          name: 'Group',
          pageNumber: 2,
          pageSize: 25,
          isActive: false,
          subjectId: 's',
          teacherId: 't',
          classroomId: 'c',
        },
        signal,
      ),
    ).toEqual(data);
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.appointments.getAll, {
      signal,
      params: {
        Search: 'Group',
        PageNumber: 2,
        PageSize: 25,
        IsActive: false,
        SubjectId: 's',
        TeacherId: 't',
        ClassroomId: 'c',
      },
    });
  });

  it('requests only teachers for the selected subject', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data: [] } });
    await fetchAppointmentTeachers('subject');
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.appointments.teachers, {
      params: { subjectId: 'subject' },
      signal: undefined,
    });
  });
});
