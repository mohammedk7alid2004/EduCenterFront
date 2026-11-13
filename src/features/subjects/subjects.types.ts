export interface SubjectDto {
  id: string;
  name: { ar: string | null; en: string | null };
  note: { ar: string | null; en: string | null };
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export type SubjectDetail = SubjectDto;

export interface PaginatedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResult<T> {
  isSuccess: boolean;
  statusCode: number;
  data: T;
  message: string;
}

export interface SubjectFilters {
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface CreateSubjectPayload {
  nameAr: string;
  nameEn: string;
  noteAr?: string;
  noteEn?: string;
}

export interface UpdateSubjectPayload {
  id: string;
  nameAr: string;
  nameEn: string;
  noteAr?: string;
  noteEn?: string;
}

export interface DeleteSubjectsPayload {
  ids: string[];
}
