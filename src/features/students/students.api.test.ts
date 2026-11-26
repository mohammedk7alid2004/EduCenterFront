import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from '@/infrastructure/api';
import { fetchStudentTemplate, importStudents } from './students.api';

vi.mock('@/infrastructure/api', async () => ({
  ...(await vi.importActual<typeof import('@/infrastructure/api')>('@/infrastructure/api')),
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

describe('students template and import API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('downloads student excel template blob', async () => {
    const blob = new Blob(['xlsx'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: blob });
    const controller = new AbortController();

    expect(await fetchStudentTemplate(controller.signal)).toBe(blob);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/Students/Template', {
      responseType: 'blob',
      signal: controller.signal,
    });
  });

  it('uploads student excel file and returns import summary', async () => {
    const summary = {
      totalRows: 2,
      uploadedCount: 1,
      skippedCount: 1,
      skippedRows: [3],
      skippedDetails: [{ rowNumber: 3, reason: 1, message: 'Email exists' }],
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: true, data: summary },
    });
    const file = new File(['excel'], 'students.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    expect(await importStudents(file)).toEqual(summary);
    const payload = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
    expect(payload.get('file')).toBe(file);
  });

  it('rejects unsuccessful import envelopes with ApiError', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: false, statusCode: 400, message: 'Invalid Excel format' },
    });
    const file = new File(['bad'], 'bad.xlsx');

    await expect(importStudents(file)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid Excel format',
    } satisfies Partial<ApiError>);
  });
});
