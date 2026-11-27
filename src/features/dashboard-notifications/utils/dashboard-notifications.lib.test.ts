import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ROUTES } from '@/shared/constants';
import { DASHBOARD_NOTIFICATION_TYPE } from '../constants';
import type { DashboardNotificationDto } from '../types';
import {
  resolveNotificationMessage,
  resolveNotificationRoute,
  resolveNotificationTitle,
} from './dashboard-notifications.lib';

const sampleItem: DashboardNotificationDto = {
  id: 'n-1',
  title: 'New Student Registration',
  titleAr: 'تسجيل طالب جديد',
  titleEn: 'New Student Registration',
  messageAr: 'قام الطالب أحمد بتسجيل حساب جديد',
  messageEn: 'Student Ahmed registered a new account',
  mediaUrl: null,
  isRead: false,
  createdAt: '2026-11-27T11:50:00Z',
  type: DASHBOARD_NOTIFICATION_TYPE.newStudent,
  relatedId: 's-1',
};

describe('dashboard notifications helpers', () => {
  it('resolves Arabic and English titles and messages', () => {
    expect(resolveNotificationTitle(sampleItem, 'ar')).toBe('تسجيل طالب جديد');
    expect(resolveNotificationTitle(sampleItem, 'en')).toBe('New Student Registration');
    expect(resolveNotificationMessage(sampleItem, 'ar')).toBe('قام الطالب أحمد بتسجيل حساب جديد');
    expect(resolveNotificationMessage(sampleItem, 'en')).toBe(
      'Student Ahmed registered a new account',
    );
  });

  it('translates legacy single-language DB titles to active UI language', () => {
    const arT = ((key: string) =>
      key === 'dashboardNotifications.titles.newContactUs'
        ? 'رسالة تواصل جديدة'
        : 'تسجيل طالب جديد') as unknown as TFunction;

    const legacyContactUs: DashboardNotificationDto = {
      ...sampleItem,
      id: 'n-2',
      type: DASHBOARD_NOTIFICATION_TYPE.general,
      title: 'New Contact Us Message',
      titleAr: null,
      titleEn: null,
      messageAr: 'تم استقبال رسالة تواصل جديدة',
      messageEn: 'A new contact us message has been received',
    };

    expect(resolveNotificationTitle(legacyContactUs, 'ar', arT)).toBe('رسالة تواصل جديدة');
  });

  it('resolves student route for new student registration notifications', () => {
    expect(resolveNotificationRoute(sampleItem)).toBe(ROUTES.students);
  });
});
