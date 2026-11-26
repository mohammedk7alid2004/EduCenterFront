import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api';
import { createSubject, toggleSubjectStatus, updateSubject } from './subjects.commands.api';
import { fetchSubject } from '../queries';
import { useSaveSubject } from './subjects.commands';
vi.mock('./subjects.commands.api', () => ({
  createSubject: vi.fn(),
  toggleSubjectStatus: vi.fn(),
  updateSubject: vi.fn(),
}));
vi.mock('../queries', () => ({
  fetchSubject: vi.fn(),
}));
describe('subject save retries', () => {
  it('retains the created ID when applying the separate status operation fails', async () => {
    vi.mocked(createSubject).mockResolvedValue('created-id');
    vi.mocked(fetchSubject).mockResolvedValue({
      id: 'created-id',
      isActive: true,
      name: { ar: '', en: 'Physics' },
      note: { ar: '', en: '' },
      createdAt: '',
      createdBy: '',
      updatedAt: null,
      updatedBy: null,
    });
    vi.mocked(updateSubject).mockResolvedValue();
    vi.mocked(toggleSubjectStatus)
      .mockRejectedValueOnce(new ApiError('NETWORK'))
      .mockResolvedValueOnce();
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSaveSubject(), { wrapper });
    const values = { nameAr: '', nameEn: 'Physics', isActive: false };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toThrow();
    });
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(createSubject).toHaveBeenCalledTimes(1);
    expect(updateSubject).toHaveBeenCalledWith({ id: 'created-id', nameAr: '', nameEn: 'Physics' });
    expect(toggleSubjectStatus).toHaveBeenCalledTimes(2);
    client.clear();
  });
});
