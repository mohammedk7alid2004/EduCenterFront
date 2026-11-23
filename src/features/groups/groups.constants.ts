export const GROUP_STATUS = {
  active: 1,
  completed: 2,
  paused: 3,
} as const;

export const GROUP_FILTER_PARAMS = {
  search: 'q',
  subject: 'subject',
  level: 'level',
  grade: 'grade',
  status: 'status',
  view: 'view',
} as const;

export const GROUP_VIEW = { calendar: 'calendar', list: 'list' } as const;
export const GROUP_CALENDAR_PAGE_SIZE = 100;
