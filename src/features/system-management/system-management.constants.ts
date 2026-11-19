import type { IconName } from '@/config';
export const SYSTEM_TAB_PARAM = 'tab';
export const CENTER_BRAND_ENDPOINT = '/v1/CenterSettings/website';
export const SYSTEM_TABS = [
  {
    key: 'privacy',
    endpoint: '/v1/PrivacyPolicy',
    read: 'PrivacyPolicy.View',
    update: 'PrivacyPolicy.Update',
    icon: 'permission',
  },
  {
    key: 'registration',
    endpoint: '/v1/StudentRegistration',
    read: 'StudentRegistration.View',
    update: 'StudentRegistration.Update',
    icon: 'logout',
  },
  {
    key: 'terms',
    endpoint: '/v1/TermsAndConditions',
    read: 'TermsAndConditions.View',
    update: 'TermsAndConditions.Update',
    icon: 'schedule',
  },
  {
    key: 'social',
    endpoint: '/v1/SocialMediaLinks',
    read: 'SocialMediaLinks.View',
    update: 'SocialMediaLinks.Update',
    icon: 'link',
  },
  { key: 'faq', endpoint: '/v1/FAQ', read: 'FAQ.ViewAll', update: 'FAQ.Update', icon: 'help' },
  {
    key: 'payment',
    endpoint: '/v1/PaymentPolicy',
    read: 'PaymentPolicy.View',
    update: 'PaymentPolicy.Update',
    icon: 'payment',
  },
  { key: 'help', endpoint: '/v1/Help', read: 'Help.View', update: 'Help.Update', icon: 'info' },
  {
    key: 'center',
    endpoint: '/v1/CenterSettings',
    read: 'CenterSettings.View',
    update: 'CenterSettings.Update',
    icon: 'building',
  },
] as const satisfies readonly {
  key: string;
  endpoint: string;
  read: string;
  update: string;
  icon: IconName;
}[];
export type SystemTab = (typeof SYSTEM_TABS)[number];

export interface SystemTabGroup {
  readonly key: 'center' | 'policies' | 'channels';
  readonly tabKeys: readonly SystemTab['key'][];
}

export const SYSTEM_TAB_GROUPS: readonly SystemTabGroup[] = [
  {
    key: 'center',
    tabKeys: ['center'],
  },
  {
    key: 'policies',
    tabKeys: ['privacy', 'registration', 'terms', 'payment', 'help'],
  },
  {
    key: 'channels',
    tabKeys: ['social', 'faq'],
  },
] as const;
export const FAQ_PERMISSIONS = {
  read: 'FAQ.ViewAll',
  detail: 'FAQ.ShowOne',
  create: 'FAQ.Create',
  update: 'FAQ.Update',
  delete: 'FAQ.Delete',
  status: 'FAQ.ActiveStatus',
} as const;
export const FAQ_ENDPOINTS = {
  base: '/v1/FAQ',
  detail: (id: string) => `/v1/FAQ/${encodeURIComponent(id)}`,
  status: (id: string) => `/v1/FAQ/ToggleStatus/${encodeURIComponent(id)}`,
} as const;
export const SOCIAL_PLATFORMS = [
  'WhatsApp',
  'Facebook',
  'TikTok',
  'Snapchat',
  'Twitter',
  'Instagram',
  'LinkedIn',
  'Email',
  'PlayStore',
  'AppStore',
] as const;
export const SOCIAL_ICONS: Record<string, IconName> = {
  WhatsApp: 'whatsapp',
  Facebook: 'facebook',
  TikTok: 'tiktok',
  Snapchat: 'snapchat',
  Twitter: 'socialX',
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
  Email: 'mail',
  PlayStore: 'playStore',
  AppStore: 'appStore',
};
export const SETTINGS_IMAGE = {
  accept: '.jpg,.jpeg,.png,.webp',
  extensions: /\.(jpe?g|png|webp)$/i,
  maxBytes: 10 * 1024 * 1024,
} as const;
export const LOGO_FIELDS = ['invoiceLogo', 'navbarLogo', 'footerLogo'] as const;
export const SETTINGS_DIALOG = { edit: 'edit', view: 'view' } as const;
