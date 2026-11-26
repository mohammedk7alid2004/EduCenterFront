import type { TFunction } from 'i18next';
import { z } from 'zod';
import { NOTIFICATION_VALIDATION } from '../constants';

export function createNotificationSchema(t: TFunction) {
  const rules = NOTIFICATION_VALIDATION;
  const required = t('validation.required');

  return z.object({
    title: z.string().trim().min(1, required).max(rules.titleMax),
    type: z.coerce.number().refine((v) => v > 0, { message: required }),
    groupId: z.string().optional().default(''),
    levelId: z.string().optional().default(''),
    gradeId: z.string().optional().default(''),
    message: z.string().trim().min(1, required).max(rules.messageMax),
    image: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || (rules.acceptedImageTypes as readonly string[]).includes(file.type),
        t('notifications.validation.imageType'),
      )
      .refine(
        (file) => !file || file.size <= rules.maxImageSizeMb * 1024 * 1024,
        t('notifications.validation.imageSize', { max: rules.maxImageSizeMb }),
      ),
  });
}
