import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/api';
import { saveFaq, toggleFaq } from './system-management.api';
import { useSaveFaq } from './system-management.queries';
vi.mock('./system-management.api', () => ({ saveFaq: vi.fn(), toggleFaq: vi.fn() }));
describe('FAQ save retries', () => {
  it('reuses the created FAQ after a separate status update fails', async () => {
    const saved = {
      id: 'created-id',
      question: { ar: '', en: 'Question' },
      answer: { ar: '', en: 'Answer' },
      isActive: true,
    };
    vi.mocked(saveFaq).mockResolvedValue(saved);
    vi.mocked(toggleFaq).mockRejectedValueOnce(new ApiError('NETWORK')).mockResolvedValueOnce();
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSaveFaq(), { wrapper });
    const values = {
      questionAr: '',
      questionEn: 'Question',
      answerAr: '',
      answerEn: 'Answer',
      isActive: false,
    };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toThrow();
    });
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(saveFaq).toHaveBeenNthCalledWith(1, undefined, values);
    expect(saveFaq).toHaveBeenNthCalledWith(2, 'created-id', values);
    expect(toggleFaq).toHaveBeenCalledTimes(2);
    client.clear();
  });
});
