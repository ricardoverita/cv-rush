import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@cv-rush/contracts';
import { defineRouting } from 'next-intl/routing';

/**
 * Locale-prefixed URLs (/en/…, /es/…). Detection uses Accept-Language with English as the
 * fallback; a manual choice is stored in a cookie and always wins (ADR-006).
 */
export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});
