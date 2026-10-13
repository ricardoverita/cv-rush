import type { Locale } from '@cv-rush/contracts';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RunExperience } from '@/components/run/RunExperience';
import { fetchCatalog } from '@/lib/catalog';

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RunPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>;
}) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);
  const catalog = await fetchCatalog(API_INTERNAL_URL, locale as Locale);
  const t = await getTranslations('errors');
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-16 sm:px-6">
      {catalog ? (
        <RunExperience sessionId={sessionId} catalog={catalog} />
      ) : (
        <p role="alert" className="rounded-xl border border-border bg-surface p-5">
          {t('SERVICE_UNAVAILABLE')}
        </p>
      )}
    </main>
  );
}
