import type { StudentLocalizedName } from './students.types';
export function studentLocalizedName(name: StudentLocalizedName | null, language: string): string {
  return name?.[language.startsWith('ar') ? 'ar' : 'en'] || name?.en || name?.ar || '';
}
