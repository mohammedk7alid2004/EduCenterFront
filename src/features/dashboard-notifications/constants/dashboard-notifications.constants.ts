export const DASHBOARD_NOTIFICATION_EVENT = 'ReceiveDashboardNotification' as const;
export const DASHBOARD_NOTIFICATION_PAGE_SIZE = 15;
export const DASHBOARD_NOTIFICATION_TYPE = {
  general: 0,
  newOrder: 1,
  newClient: 2,
  newStudent: 3,
  newContactUs: 4,
} as const;
