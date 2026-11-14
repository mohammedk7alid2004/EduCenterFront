export interface ApiResult<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T;
}
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}
export interface ListFilters {
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface AuditFields {
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
