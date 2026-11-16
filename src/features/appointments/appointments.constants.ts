export const APPOINTMENT_STATUS = { active: 1, completed: 2, paused: 3 } as const;
export const APPOINTMENT_ITERATION = { weekly: 1, monthly: 2, yearly: 3 } as const;
export const WEEK_DAYS = [6, 0, 1, 2, 3, 4, 5] as const;
export const APPOINTMENT_VIEW = { list: 'list', calendar: 'calendar' } as const;
export const CALENDAR_PERIOD = { daily: 'daily', weekly: 'weekly', monthly: 'monthly' } as const;
export const APPOINTMENT_PARAMS = {
  view: 'view',
  subject: 'subject',
  teacher: 'teacher',
  classroom: 'classroom',
} as const;
export const OPTIONS_PAGE_SIZE = 100;
export const MINUTES_PER_DAY = 1440;
export const CALENDAR_HOUR_HEIGHT = 88;
