export const NOTIFICATION_TYPE = {
  students: 1,
  teachers: 2,
} as const;

export const NOTIFICATION_FILTER_PARAMS = {
  type: 'type',
  group: 'group',
  level: 'level',
  grade: 'grade',
} as const;

export const NOTIFICATION_VALIDATION = {
  titleMax: 150,
  messageMax: 1000,
  acceptedImageTypes: ['image/png', 'image/jpeg', 'image/webp'],
  maxImageSizeMb: 5,
} as const;
