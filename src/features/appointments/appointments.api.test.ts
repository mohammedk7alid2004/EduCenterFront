import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '@/core/api';
import {
  fetchAppointments,
  saveAppointment,
  deleteAppointments,
  setAppointmentStatus,
  fetchAppointmentTeachers,
} from './appointments.api';
import type { AppointmentValues } from './appointments.types';
vi.mock('@/core/api', async () => ({
  ...(await vi.importActual<typeof import('@/core/api')>('@/core/api')),
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));
const values: AppointmentValues = {
  groupName: 'Group',
  subjectId: 'subject',
  teacherId: 'teacher',
  classroomId: 'room',
  level: 'Primary',
  grade: '3',
  startTime: '10:00',
  endTime: '12:00',
  days: [6, 2],
  iteration: 1,
  numberOfIterations: 5,
  maxCapacity: 50,
  notes: '',
  status: 3,
};
describe('appointment backend contract', () => {
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
  it('serializes TimeOnly, numeric enums, days, capacity and existing id on save', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { isSuccess: true } });
    await saveAppointment(values, 'existing');
    expect(apiClient.put).toHaveBeenCalledWith(
      API_ENDPOINTS.appointments.update,
      { ...values, id: 'existing', startTime: '10:00:00', endTime: '12:00:00' },
      { signal: undefined },
    );
  });
  it('supports exact three-state updates and JSON bulk deletion', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { isSuccess: true } });
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { isSuccess: true } });
    await setAppointmentStatus('one', 2);
    await deleteAppointments(['one', 'two']);
    expect(apiClient.patch).toHaveBeenCalledWith(
      API_ENDPOINTS.appointments.setStatus('one'),
      null,
      { params: { status: 2 }, signal: undefined },
    );
    expect(apiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.appointments.delete, {
      data: { ids: ['one', 'two'] },
      signal: undefined,
    });
  });
  it('requests only teachers for the selected subject and rejects failed envelopes', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { isSuccess: true, data: [] } });
    await fetchAppointmentTeachers('subject');
    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.appointments.teachers, {
      params: { subjectId: 'subject' },
      signal: undefined,
    });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { isSuccess: false, statusCode: 400, message: 'Invalid classroom' },
    });
    await expect(saveAppointment(values)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid classroom',
    });
  });
});
