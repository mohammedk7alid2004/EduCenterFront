import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiError } from '@/infrastructure/api';
export function setServerErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  aliases: Readonly<Record<string, Path<T>>> = {},
): void {
  Object.entries(error.fieldErrors).forEach(([field, messages]) =>
    setError(
      aliases[field] ??
        aliases[field.charAt(0).toLowerCase() + field.slice(1)] ??
        ((field.charAt(0).toLowerCase() + field.slice(1)) as Path<T>),
      {
        type: 'server',
        message: messages[0],
      },
    ),
  );
}
