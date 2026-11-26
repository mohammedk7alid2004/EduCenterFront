import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
    rememberMe: z.boolean().default(false),
  });
}

export function createRecoveryEmailSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
  });
}

export function createRecoveryCodeSchema(t: TFunction, codeLength: number) {
  return z.object({
    code: z.string().regex(new RegExp(`^\\d{${codeLength}}$`), t('auth.recovery.validation.code')),
  });
}

export function createRecoveryPasswordSchema(t: TFunction) {
  return z
    .object({
      password: z
        .string()
        .regex(
          /(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}/,
          t('auth.recovery.validation.passwordStrength'),
        ),
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.recovery.validation.passwordMatch'),
    });
}
