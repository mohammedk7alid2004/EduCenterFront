import type { ListFilters } from '@/shared/types';
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}
export interface ContactFilters extends ListFilters {
  email?: string;
  phone?: string;
  subject?: string;
}
export interface ContactImportResult {
  totalRows: number;
  uploadedCount: number;
  skippedCount: number;
  skippedRows: number[];
  skippedDetails: { rowNumber: number; reason: number; message?: string | null }[];
}
export interface SendContactEmailValues {
  email: string;
  subject: string;
  message: string;
  file: File | null;
}
