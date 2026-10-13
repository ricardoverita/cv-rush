import { z } from 'zod';

/** Locales supported by the product. English is the global fallback. */
export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export const DEFAULT_LOCALE = 'en' satisfies (typeof SUPPORTED_LOCALES)[number];

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;

export function isLocale(value: unknown): value is Locale {
  return LocaleSchema.safeParse(value).success;
}
