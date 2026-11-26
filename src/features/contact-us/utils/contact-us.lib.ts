import type { ContactFilters } from '../types';
export function contactDate(value: string, language: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
export { downloadBlob as downloadContactFile } from '@/shared/utils';

export function contactFilterParams(filters: ContactFilters) {
  return {
    Name: filters.name,
    Email: filters.email,
    Phone: filters.phone,
    Subject: filters.subject,
    PageNumber: filters.pageNumber,
    PageSize: filters.pageSize,
  };
}
