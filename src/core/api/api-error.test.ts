import { describe, expect, it } from 'vitest';
import { normalizeApiError } from './api-error';
describe('normalizeApiError', () => {
  it('maps 422 errors and fields', () => {
    const error = normalizeApiError({
      response: { status: 422, data: { errors: { email: ['Invalid email'] } } },
    });
    expect(error.code).toBe('VALIDATION');
    expect(error.fieldErrors.email).toEqual(['Invalid email']);
  });
  it('preserves a backend message for user-facing errors', () => {
    const error = normalizeApiError({
      response: { status: 404, data: { message: 'User not found.', errors: {} } },
    });
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('User not found.');
  });
});
