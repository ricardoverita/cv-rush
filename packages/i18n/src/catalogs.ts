import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@cv-rush/contracts';

/** Message namespaces. Each one is a JSON file per locale in `messages/<locale>/<namespace>.json`. */
export const NAMESPACES = ['common', 'errors', 'onboarding', 'run'] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const LOCALES: readonly Locale[] = SUPPORTED_LOCALES;
export const FALLBACK_LOCALE: Locale = DEFAULT_LOCALE;

export type MessageTree = { [key: string]: string | MessageTree };
