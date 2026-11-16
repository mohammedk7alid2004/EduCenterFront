import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fetchAppointments } from './appointments.api';
import { useAppointments } from './appointments.queries';
import type { AppointmentDto } from './appointments.types';
vi.mock('./appointments.api', () => ({ fetchAppointments: vi.fn() }));
describe('calendar data completeness', () => {
  it('loads every backend page instead of showing only the current list page', async () => {
    const first = { id: 'first' } as AppointmentDto;
    const second = { id: 'second' } as AppointmentDto;
    vi.mocked(fetchAppointments)
      .mockResolvedValueOnce({ items: [first], totalCount: 2, totalPages: 2, pageNumber: 1 })
      .mockResolvedValueOnce({ items: [second], totalCount: 2, totalPages: 2, pageNumber: 2 });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => useAppointments({ pageNumber: 5, pageSize: 10, subjectId: 'subject' }, true),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toEqual([first, second]);
    expect(fetchAppointments).toHaveBeenNthCalledWith(
      2,
      { pageNumber: 2, pageSize: 100, subjectId: 'subject' },
      expect.any(AbortSignal),
    );
    client.clear();
  });
});
