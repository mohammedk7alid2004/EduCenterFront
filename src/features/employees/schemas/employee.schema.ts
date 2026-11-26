import type { TFunction } from 'i18next';
import { z } from 'zod';
import { EMPLOYEE_GENDER } from '../constants';

export function createEmployeeSchema(t: TFunction, isEdit: boolean) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(100, t('validation.maxLength', { count: 100 })),
    phoneNumber: z
      .string()
      .trim()
      .max(20, t('validation.maxLength', { count: 20 }))
      .refine(
        (value) => !value || /^\+?[0-9\s\-()]+$/.test(value),
        t('profile.validation.employeePhone'),
      )
      .optional(),
    email: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .email(t('auth.validation.emailInvalid'))
      .max(150, t('validation.maxLength', { count: 150 })),
    password: z
      .string()
      .refine(
        (value) =>
          Boolean(isEdit && !value) ||
          (value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[\W_]/.test(value)),
        t('auth.recovery.validation.passwordStrength'),
      ),
    roleId: z.string().min(1, t('validation.required')),
    gender: z
      .enum([EMPLOYEE_GENDER.male, EMPLOYEE_GENDER.female])
      .or(z.literal(''))
      .refine((value) => isEdit || Boolean(value), t('validation.required')),
    isActive: z.boolean(),
  });
}
