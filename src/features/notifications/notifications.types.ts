import type { AuditFields, ListFilters } from '@/infrastructure/api';

export interface NotificationLocalizedName {
  ar: string | null;
  en: string | null;
}

export interface NotificationDto extends AuditFields {
  id: string;
  title: string;
  type: number;
  groupId: string | null;
  groupName: string | null;
  levelId: string | null;
  levelName: NotificationLocalizedName | null;
  gradeId: string | null;
  gradeName: NotificationLocalizedName | null;
  message: string;
  imageUrl: string | null;
  isActive: boolean;
}

export interface NotificationValues {
  title: string;
  type: number;
  groupId: string;
  levelId: string;
  gradeId: string;
  message: string;
  image: File | null;
  removeImage?: boolean;
}

export interface NotificationFilters extends ListFilters {
  type?: number;
  groupId?: string;
  levelId?: string;
  gradeId?: string;
}

export interface NotificationGroupOption {
  id: string;
  name: string;
}

export interface NotificationSelectOption {
  id: string;
  name: NotificationLocalizedName;
}
