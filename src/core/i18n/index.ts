import i18n from 'i18next'; import { initReactI18next } from 'react-i18next'; import { STORAGE_KEYS } from '@/config'; import en from './locales/en.json'; import ar from './locales/ar.json';
export const supportedLanguages = ['en', 'ar'] as const; export type AppLanguage = (typeof supportedLanguages)[number];
void i18n.use(initReactI18next).init({ resources: { en: { translation: en }, ar: { translation: ar } }, lng: localStorage.getItem(STORAGE_KEYS.language) ?? 'en', fallbackLng: 'en', interpolation: { escapeValue: false } });
export function setLanguage(language: AppLanguage): void { localStorage.setItem(STORAGE_KEYS.language, language); void i18n.changeLanguage(language); document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'; }
setLanguage(i18n.language as AppLanguage); export default i18n;
