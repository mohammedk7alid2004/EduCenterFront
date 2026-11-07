import { describe, expect, it } from 'vitest'; import { normalizeApiError } from './api-error';
describe('normalizeApiError', () => { it('maps 422 errors and fields', () => { const error = normalizeApiError({ response: { status: 422, data: { errors: { email: ['Invalid email'] } } } }); expect(error.code).toBe('VALIDATION'); expect(error.fieldErrors.email).toEqual(['Invalid email']); }); });
