import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createSubjectSchema(t: TFunction, arabic: boolean) {
  return z
    .object({
      nameAr: z.string().trim(),
      nameEn: z.string().trim(),
      noteAr: z.string(),
      noteEn: z.string(),
      isActive: z.boolean(),
    })
    .refine((values) => values.nameAr || values.nameEn, {
      path: [arabic ? 'nameAr' : 'nameEn'],
      message: t('validation.subjectName'),
    });
}

export type SubjectFormValues = z.infer<ReturnType<typeof createSubjectSchema>>;
