import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function SiteHeader() {
  const t = useTranslations('common');
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
      <Link href="/" aria-label={t('home')} className="text-lg font-bold tracking-tight">
        {t('landing.title')}
      </Link>
      <LanguageSwitcher />
    </header>
  );
}
