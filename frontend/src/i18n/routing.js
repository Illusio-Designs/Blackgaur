import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'hi', 'gu'];
export const defaultLocale = 'en';

export const localeNames = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
};

export const localeShort = {
  en: 'EN',
  hi: 'HI',
  gu: 'GU',
};

export function isLocale(value) {
  return locales.includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
