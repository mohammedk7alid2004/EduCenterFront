import type { NotificationLocalizedName } from '../types';

export function notificationLocalizedName(
  name: NotificationLocalizedName | null | undefined,
  language: string,
): string {
  if (!name) return '';
  return (language === 'ar' ? name.ar : name.en) ?? name.ar ?? name.en ?? '';
}
