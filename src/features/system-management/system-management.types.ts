import type { AuditFields } from '@/infrastructure/api';
export interface LocalizedText {
  ar: string | null;
  en: string | null;
}
export interface ContentDto {
  id: string;
  description: LocalizedText | null;
  updatedBy: string | null;
  updatedAt: string | null;
}
export interface ContentValues {
  descriptionAr: string;
  descriptionEn: string;
}
export interface SocialLink {
  platformName: string;
  url: string;
}
export interface CenterLocation {
  location: string | null;
  lat: number | null;
  long: number | null;
}
export interface SocialSettings {
  links: SocialLink[];
  mainPhoneNumber: string | null;
  othersPhoneNumbers: string[];
  locations: CenterLocation[];
}
export interface CenterSettings {
  centerNameAr: string | null;
  centerNameEn: string | null;
  workingHoursAr: string | null;
  workingHoursEn: string | null;
  mainPhoneNumber: string | null;
  othersPhoneNumbers: string[];
  locations: CenterLocation[];
  invoiceLogoUrl: string | null;
  navbarLogoUrl: string | null;
  footerLogoUrl: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}
export interface CenterValues {
  centerNameAr: string;
  centerNameEn: string;
  workingHoursAr: string;
  workingHoursEn: string;
  mainPhoneNumber: string;
  othersPhoneNumbers: string[];
  locations: CenterLocation[];
  invoiceLogo?: File;
  navbarLogo?: File;
  footerLogo?: File;
}
export interface FaqDto extends AuditFields {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  isActive: boolean;
}
export interface FaqValues {
  isActive: boolean;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}
