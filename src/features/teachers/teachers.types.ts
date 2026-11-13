export interface TeacherSubjectRef {
  id: string;
  name: { ar: string | null; en: string | null };
}

export interface TeacherDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  notes: string | null;
  subjects: TeacherSubjectRef[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

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

export interface TeacherFilters {
  name?: string;
  email?: string;
  phoneNumber?: string;
  subjectId?: string;
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface CreateTeacherPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  subjectIds: string[];
  notes?: string;
  isActive: boolean;
}

export interface UpdateTeacherPayload {
  id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  subjectIds?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface DeleteTeachersPayload {
  ids: string[];
}
