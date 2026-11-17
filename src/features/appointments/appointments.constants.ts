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

export const TIME_PICKER = {
  hours: 12,
  minutes: 60,
  minuteStep: 5,
  dialSize: 224,
  dialRadius: 88,
  modes: { hour: 'hour', minute: 'minute' },
  periods: { am: 'am', pm: 'pm' },
} as const;

export const APPOINTMENT_QR = {
  previewSize: 320,
  exportSize: 1000,
  margin: 4,
  cardWidth: 1200,
  codeTop: 60,
  labelFontSize: 34,
  lineHeight: 52,
  footerPadding: 60,
} as const;
export const QR_EXPORT_FORMAT = { png: 'png', pdf: 'pdf' } as const;
