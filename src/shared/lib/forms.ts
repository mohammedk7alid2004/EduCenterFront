import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiError } from '@/core/api';
export function setServerErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
): void {
  Object.entries(error.fieldErrors).forEach(([field, messages]) =>
    setError((field.charAt(0).toLowerCase() + field.slice(1)) as Path<T>, {
      type: 'server',
      message: messages[0],
    }),
  );
}
