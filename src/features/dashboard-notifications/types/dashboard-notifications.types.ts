export interface DashboardNotificationDto {
  id: string;
  title: string;
  titleAr: string | null;
  titleEn: string | null;
  messageAr: string;
  messageEn: string;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string;
  type: number;
  relatedId: string | null;
}

export interface DashboardNotificationsFeedDto {
  items: DashboardNotificationDto[];
  unreadCount: number;
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}

export type DashboardHubStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';
