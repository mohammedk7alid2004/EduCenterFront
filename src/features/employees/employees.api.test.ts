import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/core/api';
import { createEmployee, updateEmployee } from './employees.api';
import type { EmployeePayload } from './employees.types';

vi.mock('@/core/api', async () => ({
  ...(await vi.importActual<typeof import('@/core/api')>('@/core/api')),
  apiClient: { post: vi.fn(), put: vi.fn() },
}));
const values: EmployeePayload = {
  fullName: ' Employee ',
  email: ' employee@example.com ',
  password: 'Strong123!',
  roleId: 'role-id',
  gender: '1',
  phoneNumber: '01234567890',
};
describe('employee multipart contract', () => {
  beforeEach(() => vi.clearAllMocks());
  it('sends the required gender and password confirmation with cancellation', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { isSuccess: true, data: { id: 'created-id' } },
    });
    const signal = new AbortController().signal;
    await createEmployee(values, signal);
    const [, form, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(form).toBeInstanceOf(FormData);
    expect(Object.fromEntries((form as FormData).entries())).toEqual({
      FullName: 'Employee',
      Email: 'employee@example.com',
      Password: 'Strong123!',
      ConfirmPassword: 'Strong123!',
      RoleId: 'role-id',
      Gender: '1',
      PhoneNumber: '01234567890',
    });
    expect(config).toEqual({ signal });
  });
  it('omits a blank password when editing instead of replacing the existing password', async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { isSuccess: true, data: true } });
    await updateEmployee('employee-id', { ...values, password: '' });
    const form = vi.mocked(apiClient.put).mock.calls[0][1] as FormData;
    expect(form.get('Id')).toBe('employee-id');
    expect(form.has('Password')).toBe(false);
    expect(form.has('ConfirmPassword')).toBe(false);
    expect(form.has('IsActive')).toBe(false);
  });
});
