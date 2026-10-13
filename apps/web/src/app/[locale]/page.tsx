import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { fetchApiStatus } from '@/lib/api-status';

const REPOSITORY_URL = 'https://github.com/ricardoverita/cv-rush';
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

// The API status is checked on every request.
export const dynamic = 'force-dynamic';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common.landing');
  const apiStatus = await fetchApiStatus(API_INTERNAL_URL);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <LanguageSwitcher />
      </header>

      <p className="text-lg text-muted">{t('tagline')}</p>

      <section aria-labelledby="status" className="rounded-lg border border-slate-700 p-6">
        <h2 id="status" className="mb-2 text-xl font-semibold">
          {t('statusTitle')}
        </h2>
        <p className="mb-4 text-muted">{t('statusBody')}</p>
        <p data-testid="api-status">
          {t('apiStatus', { status: apiStatus === 'online' ? t('apiOnline') : t('apiOffline') })}
        </p>
      </section>

      <nav className="flex flex-wrap gap-4 text-accent">
        <a className="hover:underline" href={`${REPOSITORY_URL}/tree/main/docs`}>
          {t('readDocs')}
        </a>
        <a className="hover:underline" href={`${REPOSITORY_URL}/blob/main/docs/roadmap/README.md`}>
          {t('viewRoadmap')}
        </a>
        <a className="hover:underline" href={`${REPOSITORY_URL}/blob/main/CONTRIBUTING.md`}>
          {t('contribute')}
        </a>
      </nav>
    </main>
  );
}
