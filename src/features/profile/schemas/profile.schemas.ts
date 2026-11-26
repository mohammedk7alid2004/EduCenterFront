import type { TFunction } from 'i18next';
import { z } from 'zod';
import { PASSWORD_SPECIAL_PATTERN, PROFILE_IMAGE, PROFILE_PHONE_PATTERN } from '../constants';

export function createProfileSchema(t: TFunction, hasExistingPhone: boolean) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(150, t('validation.maxLength', { count: 150 })),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => !value || PROFILE_PHONE_PATTERN.test(value), t('profile.validation.phone'))
      .refine((value) => !hasExistingPhone || Boolean(value), t('validation.required')),
    gender: z.string().min(1, t('validation.required')),
    image: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || (file.size > 0 && file.size <= PROFILE_IMAGE.maxBytes),
        t('profile.validation.imageSize'),
      )
      .refine(
        (file) => !file || PROFILE_IMAGE.extensions.test(file.name),
        t('profile.validation.imageType'),
      ),
  });
}

export function createChangePasswordSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(1, t('validation.required')),
      newPassword: z
        .string()
        .refine(
          (value) =>
            value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value) &&
            PASSWORD_SPECIAL_PATTERN.test(value),
          t('auth.recovery.validation.passwordStrength'),
        ),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      path: ['confirmPassword'],
      message: t('profile.validation.passwordMatch'),
    });
}
