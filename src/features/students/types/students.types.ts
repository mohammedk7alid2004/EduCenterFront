import type { AuditFields, ListFilters } from '@/shared/types';
export interface StudentLocalizedName {
  ar: string | null;
  en: string | null;
}
export interface StudentRelatedItem {
  id: string;
  name: StudentLocalizedName;
}
export interface StudentDto extends AuditFields {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  parentPhoneNumber: string | null;
  gender: string | null;
  role: string;
  educationLevelId: string | null;
  educationLevel: StudentLocalizedName | null;
  educationGradeId: string | null;
  educationGrade: StudentLocalizedName | null;
  isActive: boolean;
  subjects: StudentRelatedItem[];
  groups: StudentRelatedItem[];
  fees: string | null;
}
export interface StudentValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  educationLevelId: string;
  educationGradeId: string;
  gender: string;
  isActive: boolean;
  password: string;
  confirmPassword: string;
}
export interface StudentFilters extends ListFilters {
  educationLevelId?: string;
  educationGradeId?: string;
  gender?: string;
}
export interface StudentOption {
  id: string;
  name: StudentLocalizedName;
}
export interface StudentImportResult {
  totalRows: number;
  uploadedCount: number;
  skippedCount: number;
  skippedRows: number[];
  skippedDetails: { rowNumber: number; reason: number; message?: string | null }[];
}
