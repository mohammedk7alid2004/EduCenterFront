import type { AuditFields } from '@/core/api';
export interface ClassroomDto extends AuditFields {
  id: string;
  name: { ar: string | null; en: string | null };
  note: { ar: string | null; en: string | null };
  capacity: number;
  isActive: boolean;
}
export interface ClassroomValues {
  nameAr: string;
  nameEn: string;
  noteAr: string;
  noteEn: string;
  capacity: number;
  isActive: boolean;
}
