import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createRoleSchema(t: TFunction, isEdit: boolean) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { count: 50 })),
    permissionIds: isEdit
      ? z.array(z.string())
      : z.array(z.string()).min(1, t('roleManagement.form.permissionsRequired')),
  });
}
