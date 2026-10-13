'use client';

import type { CatalogResponse, SessionView } from '@cv-rush/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useProfileLabels } from '@/components/onboarding/labels';
import { useRemainingMs } from '@/lib/countdown';

/** The job review: an offer generated for the developer's profile, then Apply. */
export function JobOffer({
  session,
  catalog,
  busy,
  onApply,
  onExpired,
}: {
  session: SessionView;
  catalog: CatalogResponse;
  busy: boolean;
  onApply: () => void;
  onExpired: () => void;
}) {
  const t = useTranslations('run.job');
  const locale = useLocale();
  const labels = useProfileLabels(catalog);
  const { job } = session;
  const remaining = useRemainingMs(session.reviewExpiresAt, session.serverTime);
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: job.salary.currency,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    if (remaining !== 0) return undefined;
    const timer = setTimeout(onExpired, 600);
    return () => clearTimeout(timer);
  }, [remaining, onExpired]);

  return (
    <article
      aria-labelledby="job-title"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-8"
    >
      <p className="text-sm text-muted">{t('review')}</p>
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          {job.company.name} · {job.company.sector}
        </p>
        <h1 id="job-title" className="text-2xl font-bold sm:text-3xl">
          {labels.jobTitle(job.seniority, job.roleId)}
        </h1>
        <p data-testid="job-facts">
          {job.location} · {job.workMode} ·{' '}
          {t('salary', { min: money.format(job.salary.min), max: money.format(job.salary.max) })}
        </p>
      </header>
      <p>{job.summary}</p>
      <section>
        <h2 className="mb-2 font-semibold">{t('responsibilities')}</h2>
        <ul className="list-disc space-y-1 pl-5">
          {job.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">{t('stack')}</h2>
        <ul className="flex flex-wrap gap-2" data-testid="job-stack">
          {job.technologies.map((tech) => (
            <li key={tech.id} className="rounded-full border border-border px-3 py-1 text-sm">
              {tech.name}
            </li>
          ))}
        </ul>
      </section>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="font-semibold">{t('experience')}</dt>
          <dd>{job.experience}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t('perks')}</dt>
          <dd>{job.perks.join(' · ')}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2 border-t border-border pt-5">
        <p className="text-sm text-muted">
          {session.attempt
            ? t('applyRanked', { number: session.attempt.number, max: session.attempt.max })
            : t('applyPractice')}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onApply}
            disabled={busy || remaining === 0}
            className="min-h-12 rounded-lg bg-accent px-8 font-semibold text-accent-fg hover:opacity-90 disabled:opacity-40"
          >
            {t('apply')}
          </button>
          {remaining !== null && (
            <span className="text-sm text-muted" aria-live="off">
              {t('reviewEnds', { seconds: Math.ceil(remaining / 1000) })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
