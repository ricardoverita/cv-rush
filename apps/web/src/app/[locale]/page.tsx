import { getTranslations, setRequestLocale } from 'next-intl/server';
import { WelcomeBack } from '@/components/WelcomeBack';

const REPOSITORY_URL = 'https://github.com/ricardoverita/cv-rush';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common.landing');

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pt-8 pb-16 sm:px-6">
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-lg text-muted">{t('tagline')}</p>
        <WelcomeBack />
      </section>

      <section
        aria-labelledby="preview"
        className="rounded-xl border border-border bg-surface p-5 sm:p-6"
      >
        <h2 id="preview" className="mb-2 text-lg font-semibold">
          {t('previewTitle')}
        </h2>
        <p className="text-muted">{t('previewBody')}</p>
      </section>

      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-accent">
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
