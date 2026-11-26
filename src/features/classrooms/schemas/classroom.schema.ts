import type { TFunction } from 'i18next';
import { z } from 'zod';
import { CLASSROOM_CAPACITY } from '../constants';

export function createClassroomSchema(t: TFunction, arabic: boolean) {
  return z
    .object({
      nameAr: z.string().trim(),
      nameEn: z.string().trim(),
      noteAr: z.string(),
      noteEn: z.string(),
      capacity: z
        .number({ invalid_type_error: t('classrooms.validation.capacity') })
        .int(t('classrooms.validation.capacity'))
        .min(CLASSROOM_CAPACITY.minimum, t('classrooms.validation.capacity'))
        .max(CLASSROOM_CAPACITY.maximum, t('classrooms.validation.capacity')),
      isActive: z.boolean(),
    })
    .refine((values) => Boolean(arabic ? values.nameAr : values.nameEn), {
      path: [arabic ? 'nameAr' : 'nameEn'],
      message: t('validation.required'),
    });
}
