import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const t = useTranslations('common.language');
  const current = useLocale();
  return (
    <nav aria-label={t('label')} className="flex gap-3 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href="/"
          locale={locale}
          aria-current={locale === current ? 'true' : undefined}
          className={locale === current ? 'font-semibold underline' : 'hover:underline'}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
