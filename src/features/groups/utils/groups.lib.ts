import type { GroupLocalizedName } from '../types';

export function groupLocalizedName(
  value: GroupLocalizedName | null | undefined,
  language: string,
): string {
  if (!value) return '';
  return language.startsWith('ar') ? (value.ar ?? value.en ?? '') : (value.en ?? value.ar ?? '');
}
