import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createTeacherSchema(t: TFunction, isEdit: boolean) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { count: 50 })),
    email: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .email(t('auth.validation.emailInvalid'))
      .max(150, t('validation.maxLength', { count: 150 })),
    phoneNumber: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(20, t('validation.maxLength', { count: 20 }))
      .regex(/^\+?[0-9\s\-()]+$/, t('validation.phone')),
    password: z
      .string()
      .refine(
        (value) =>
          (isEdit && !value) ||
          (value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[\W_]/.test(value)),
        t('auth.recovery.validation.passwordStrength'),
      ),
    subjectIds: z.array(z.string()).min(1, t('validation.subjects')),
    notes: z.string(),
    isActive: z.boolean(),
  });
}

export type TeacherFormValues = z.infer<ReturnType<typeof createTeacherSchema>>;
