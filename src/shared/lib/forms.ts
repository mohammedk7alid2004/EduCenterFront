import type { Path, UseFormSetError } from 'react-hook-form'; import type { ApiError } from '@/core/api';
export function setServerErrors<T extends Record<string, unknown>>(error: ApiError, setError: UseFormSetError<T>): void { Object.entries(error.fieldErrors).forEach(([field, messages]) => setError(field as Path<T>, { type: 'server', message: messages[0] })); }
