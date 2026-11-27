import { ApiError } from './api-error';

export function assertApiSuccess(result: {
  isSuccess: boolean;
  statusCode: number;
  message?: string;
}): void {
  if (result.isSuccess) return;
  const error = new ApiError('BAD_REQUEST', result.statusCode);
  if (result.message) error.message = result.message;
  throw error;
}

export async function unwrapExcelBlob(data: Blob): Promise<Blob> {
  if (data.type.includes('json')) {
    const result: { isSuccess: boolean; statusCode: number; message?: string } = JSON.parse(
      await data.text(),
    );
    assertApiSuccess(result);
    throw new Error('errors.unknown');
  }
  return data;
}
