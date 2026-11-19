export function contactDate(value: string, language: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
export { downloadBlob as downloadContactFile } from '@/shared/utils';
