'use client';

import type { CatalogResponse, RankedStatus, RunType } from '@cv-rush/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { api } from '@/lib/api';
import { useErrorText } from './labels';

/**
 * The explicit choice between Ranked and Practice (docs/product/game-modes.md). Choosing only
 * prepares a job offer: the ranked attempt is used later, when the player applies.
 */
export function PlayChoice({ catalog }: { catalog: CatalogResponse }) {
  const t = useTranslations('run.choose');
  const locale = useLocale();
  const router = useRouter();
  const errorText = useErrorText(catalog);
  const [status, setStatus] = useState<RankedStatus | null>(null);
  const [starting, setStarting] = useState<RunType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.rankedStatus().then(setStatus, (e: unknown) => setError(errorText(e)));
    // errorText only translates; loading the status once is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async (runType: RunType) => {
    setStarting(runType);
    setError(null);
    try {
      const session = await api.createSession({ runType, locale: locale as 'en' | 'es' });
      router.push(`/play/run/${session.id}`);
    } catch (e) {
      setError(errorText(e));
      setStarting(null);
    }
  };

  const rankedOpen = status !== null && status.trackStatus !== 'practice_only';
  const rankedDisabled = !rankedOpen || status.remaining === 0 || starting !== null;
  const resetsAt = status
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
        new Date(status.resetsAt),
      )
    : '';

  return (
    <section aria-labelledby="play-choice" className="flex flex-col gap-4">
      <h2 id="play-choice" className="text-xl font-bold">
        {t('title')}
      </h2>
      {status?.activeSessionId && (
        <Link
          href={`/play/run/${status.activeSessionId}`}
          className="rounded-lg border border-accent px-4 py-3 font-semibold text-accent hover:bg-surface"
        >
          {t('resume')}
        </Link>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void start('ranked')}
          disabled={rankedDisabled}
          className="flex flex-col items-start gap-1 rounded-xl bg-accent p-5 text-left text-accent-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-lg font-bold">{t('ranked')}</span>
          <span className="font-semibold" data-testid="ranked-attempts">
            {status && rankedOpen ? t('rankedAttempts', { remaining: status.remaining }) : null}
            {status && !rankedOpen ? t('rankedPracticeOnly') : null}
          </span>
          <span className="text-sm">
            {status?.remaining === 0 ? t('rankedResets', { time: resetsAt }) : t('rankedHint')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => void start('practice')}
          disabled={starting !== null}
          className="flex flex-col items-start gap-1 rounded-xl border border-border bg-surface p-5 text-left hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-lg font-bold">{t('practice')}</span>
          <span className="text-sm text-muted">{t('practiceHint')}</span>
        </button>
      </div>
      {starting && (
        <p role="status" className="text-muted">
          {t('starting')}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
