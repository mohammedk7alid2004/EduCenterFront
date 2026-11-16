import type { ListFilters } from '@/core/api';
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
