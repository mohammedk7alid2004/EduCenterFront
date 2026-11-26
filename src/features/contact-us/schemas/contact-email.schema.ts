import type { TFunction } from 'i18next';
import { z } from 'zod';
import { CONTACT_EMAIL_VALIDATION } from '../constants';

function hasAllowedExtension(file: File): boolean {
  const lower = file.name.toLowerCase();
  return CONTACT_EMAIL_VALIDATION.extensions.some((ext) => lower.endsWith(ext));
}

export function createContactEmailSchema(t: TFunction) {
  const rules = CONTACT_EMAIL_VALIDATION;
  const required = t('validation.required');

  return z.object({
    email: z.string().trim().min(1, required).email(t('contactUs.reply.validation.email')),
    subject: z
      .string()
      .trim()
      .min(1, required)
      .max(rules.subjectMax, t('contactUs.reply.validation.subjectMax', { max: rules.subjectMax })),
    message: z
      .string()
      .trim()
      .min(1, required)
      .max(rules.messageMax, t('contactUs.reply.validation.messageMax', { max: rules.messageMax })),
    file: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || hasAllowedExtension(file),
        t('contactUs.reply.validation.fileType'),
      )
      .refine(
        (file) => !file || file.size <= rules.maxBytes,
        t('contactUs.reply.validation.fileSize'),
      ),
  });
}
