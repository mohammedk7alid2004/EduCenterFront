import type { TFunction } from 'i18next';
import { ROUTES } from '@/shared/constants';
import { DASHBOARD_NOTIFICATION_TYPE } from '../constants';
import type { DashboardNotificationDto } from '../types';

const NEW_STUDENT_TITLES = new Set(['new student registration', 'تسجيل طالب جديد']);
const NEW_CONTACT_US_TITLES = new Set(['new contact us message', 'رسالة تواصل جديدة']);

export function resolveNotificationTitle(
  item: DashboardNotificationDto,
  language: string,
  t?: TFunction,
): string {
  const isArabic = language.startsWith('ar');
  const localized = isArabic ? item.titleAr : item.titleEn;
  if (localized?.trim()) return localized.trim();

  const normalizedTitle = item.title?.trim().toLowerCase() ?? '';
  if (
    item.type === DASHBOARD_NOTIFICATION_TYPE.newStudent ||
    NEW_STUDENT_TITLES.has(normalizedTitle)
  ) {
    if (t) return t('dashboardNotifications.titles.newStudent');
  }
  if (
    item.type === DASHBOARD_NOTIFICATION_TYPE.newContactUs ||
    NEW_CONTACT_US_TITLES.has(normalizedTitle)
  ) {
    if (t) return t('dashboardNotifications.titles.newContactUs');
  }

  if (item.title?.trim()) return item.title.trim();
  return isArabic ? item.messageAr : item.messageEn;
}

export function resolveNotificationMessage(
  item: DashboardNotificationDto,
  language: string,
): string {
  const isArabic = language.startsWith('ar');
  const primary = isArabic ? item.messageAr : item.messageEn;
  const fallback = isArabic ? item.messageEn : item.messageAr;
  return primary?.trim() || fallback?.trim() || item.title;
}

export function resolveNotificationRoute(item: DashboardNotificationDto): string | null {
  if (item.type === DASHBOARD_NOTIFICATION_TYPE.newStudent) return ROUTES.students;
  if (item.type === DASHBOARD_NOTIFICATION_TYPE.newContactUs) return ROUTES.contactUs;
  if (item.messageEn.toLowerCase().includes('student') || item.messageAr.includes('الطالب')) {
    return ROUTES.students;
  }
  if (item.messageEn.toLowerCase().includes('contact') || item.messageAr.includes('رسالة تواصل')) {
    return ROUTES.contactUs;
  }
  return null;
}

export function formatNotificationTime(isoDate: string, language: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(language.startsWith('ar') ? 'ar-EG' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
