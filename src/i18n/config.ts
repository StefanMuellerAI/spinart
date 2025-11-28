export const locales = ['de', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  ja: '日本語',
};

