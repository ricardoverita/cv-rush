'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/** Switches language on the same page. The choice is remembered (NEXT_LOCALE cookie). */
export function LanguageSwitcher() {
  const t = useTranslations('common.language');
  const current = useLocale();
  const pathname = usePathname();
  return (
    <nav aria-label={t('label')} className="flex gap-3 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          lang={locale}
          aria-current={locale === current ? 'true' : undefined}
          className={locale === current ? 'font-semibold underline' : 'hover:underline'}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
