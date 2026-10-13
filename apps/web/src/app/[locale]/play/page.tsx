import type { Locale } from '@cv-rush/contracts';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PlayExperience } from '@/components/onboarding/PlayExperience';
import { fetchCatalog } from '@/lib/catalog';

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

// The catalog comes from the API at request time (never at build time).
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'onboarding' });
  return { title: `${t('title')} · CV Rush`, alternates: { canonical: `/${locale}/play` } };
}

export default async function PlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const catalog = await fetchCatalog(API_INTERNAL_URL, locale as Locale);
  const t = await getTranslations('errors');

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-16 sm:px-6">
      {catalog ? (
        <PlayExperience catalog={catalog} />
      ) : (
        <p role="alert" className="rounded-xl border border-border bg-surface p-5">
          {t('SERVICE_UNAVAILABLE')}
        </p>
      )}
    </main>
  );
}
