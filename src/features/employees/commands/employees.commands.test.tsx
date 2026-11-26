import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api';
import { createEmployee, toggleEmployeeStatus, updateEmployee } from './employees.commands.api';
import { fetchEmployee } from '../queries';
import { useSaveEmployee } from './employees.commands';
vi.mock('./employees.commands.api', () => ({
  createEmployee: vi.fn(),
  toggleEmployeeStatus: vi.fn(),
  updateEmployee: vi.fn(),
}));
vi.mock('../queries', () => ({
  fetchEmployee: vi.fn(),
}));
describe('employee save retries', () => {
  it('retains the created ID when applying the separate status operation fails', async () => {
    const employee = {
      id: 'created-id',
      name: 'Employee',
      email: 'employee@example.com',
      phoneNumber: null,
      image: null,
      gender: 'Male',
      role: { id: 'role-id', name: 'Reception' },
      isActive: true,
      createdAt: '',
      createdBy: '',
      updatedAt: null,
      updatedBy: null,
    };
    vi.mocked(createEmployee).mockResolvedValue(employee);
    vi.mocked(fetchEmployee).mockResolvedValue(employee);
    vi.mocked(updateEmployee).mockResolvedValue();
    vi.mocked(toggleEmployeeStatus)
      .mockRejectedValueOnce(new ApiError('NETWORK'))
      .mockResolvedValueOnce();
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSaveEmployee(), { wrapper });
    const values = {
      fullName: 'Employee',
      email: 'employee@example.com',
      password: 'Strong123!',
      roleId: 'role-id',
      gender: '1' as const,
      isActive: false,
    };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toThrow();
    });
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(createEmployee).toHaveBeenCalledTimes(1);
    expect(updateEmployee).toHaveBeenCalledWith('created-id', {
      fullName: 'Employee',
      email: 'employee@example.com',
      password: 'Strong123!',
      roleId: 'role-id',
      gender: '1',
    });
    expect(toggleEmployeeStatus).toHaveBeenCalledTimes(2);
    client.clear();
  });
});
