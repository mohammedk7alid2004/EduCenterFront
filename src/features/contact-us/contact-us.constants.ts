export const CONTACT_FILTER_PARAMS = {
  email: 'email',
  phone: 'phone',
  subject: 'subject',
} as const;
export const CONTACT_FILE_ACTION = { export: 'export', template: 'template' } as const;
export const CONTACT_FILE_NAMES = {
  export: 'ContactUs.xlsx',
  template: 'ContactUsImportTemplate.xlsx',
} as const;
export const CONTACT_IMPORT = {
  extensions: ['.xlsx', '.xls'],
  maxBytes: 10 * 1024 * 1024,
  accept: '.xlsx,.xls',
} as const;
export const CONTACT_EMAIL_VALIDATION = {
  subjectMax: 300,
  messageMax: 4000,
  maxBytes: 10 * 1024 * 1024,
  extensions: [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.xlsx',
    '.xls',
    '.zip',
  ],
  accept: '.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt,.xlsx,.xls,.zip',
} as const;
