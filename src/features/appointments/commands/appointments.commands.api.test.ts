import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient } from '@/shared/api';
import {
  saveAppointment,
  deleteAppointments,
  setAppointmentStatus,
} from './appointments.commands.api';
import type { AppointmentValues } from '../types';

vi.mock('@/shared/api', async () => ({
  ...(await vi.importActual<typeof import('@/shared/api')>('@/shared/api')),
  apiClient: { post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

const values: AppointmentValues = {
  groupName: 'Group',
  subjectId: 'subject',
  teacherId: 'teacher',
  classroomId: 'room',
  levelId: 'level',
  gradeId: 'grade',
  startTime: '10:00',
  endTime: '12:00',
  days: [6, 2],
  iteration: 1,
  numberOfIterations: 5,
  maxCapacity: 50,
  notes: '',
  status: 3,
};

describe('appointment command API contract', () => {
  beforeEach(() => vi.clearAllMocks());

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

  it('rejects failed envelopes on save', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { isSuccess: false, statusCode: 400, message: 'Invalid classroom' },
    });
    await expect(saveAppointment(values)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid classroom',
    });
  });
});
