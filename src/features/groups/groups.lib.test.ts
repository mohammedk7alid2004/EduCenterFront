import { describe, it, expect } from 'vitest';
import { groupLocalizedName } from './groups.lib';

describe('groups lib', () => {
  it('returns Arabic name when language starts with ar', () => {
    const localized = { ar: 'المجموعة أ', en: 'Group A' };
    expect(groupLocalizedName(localized, 'ar')).toBe('المجموعة أ');
    expect(groupLocalizedName(localized, 'ar-EG')).toBe('المجموعة أ');
  });

  it('returns English name when language is en', () => {
    const localized = { ar: 'المجموعة أ', en: 'Group A' };
    expect(groupLocalizedName(localized, 'en')).toBe('Group A');
  });

  it('falls back to alternate language if preferred is missing', () => {
    expect(groupLocalizedName({ ar: null, en: 'Group A' }, 'ar')).toBe('Group A');
    expect(groupLocalizedName({ ar: 'المجموعة أ', en: null }, 'en')).toBe('المجموعة أ');
  });

  it('returns empty string if value is null or undefined', () => {
    expect(groupLocalizedName(null, 'ar')).toBe('');
    expect(groupLocalizedName(undefined, 'en')).toBe('');
  });
});
