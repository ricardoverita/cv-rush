'use client';

import type { CatalogResponse, SessionView } from '@cv-rush/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useProfileLabels } from '@/components/onboarding/labels';
import { Link } from '@/i18n/navigation';

const COMPONENTS = ['answers', 'speed', 'completion', 'ats', 'cvHealth', 'streak'] as const;

/** The immutable result, always shown with the context it was played in. */
export function ResultScreen({
  session,
  catalog,
}: {
  session: SessionView;
  catalog: CatalogResponse;
}) {
  const t = useTranslations('run.result');
  const locale = useLocale();
  const labels = useProfileLabels(catalog);
  const result = session.result;
  if (!result) return null;
  const number = new Intl.NumberFormat(locale);
  const context = result.competingContext;
  const delivered = result.status === 'delivered';
  const body =
    result.reasonCode === 'ATS_FAILED'
      ? t('atsFailed')
      : result.reasonCode === 'CV_DESTROYED'
        ? t('cvDestroyed', { company: result.job.company })
        : result.reasonCode === 'ABANDONED'
          ? t('abandonedBody')
          : null;
  const technologies = context.technologyIds
    .map((id) => catalog.technologies.find((tech) => tech.id === id)?.name ?? id)
    .join(' · ');

  return (
    <section aria-labelledby="result-title" className="flex flex-col gap-6" data-testid="result">
      <div
        className={`flex flex-col gap-3 rounded-2xl border p-5 sm:p-8 ${delivered ? 'border-success' : 'border-danger'}`}
      >
        <h1
          id="result-title"
          className={`text-2xl font-black tracking-wide sm:text-3xl ${delivered ? 'text-success' : 'text-danger'}`}
        >
          {t(result.status)}
        </h1>
        {body && <p>{body}</p>}
        <p className="text-lg">
          {t('context', {
            name: context.displayName,
            score: number.format(result.totalScore),
            title: labels.jobTitle(context.seniority, context.roleId),
          })}
        </p>
        <p className="text-muted">{technologies}</p>
        <p className="text-4xl font-black" data-testid="result-score">
          {number.format(result.totalScore)}
        </p>
        {!delivered && <p className="text-sm text-muted">{t('notRanked')}</p>}
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li>{t('recruiter', result.counts.recruiter)}</li>
          <li>{t('technical', result.counts.technical)}</li>
          {result.atsMatch !== null && <li>{t('atsMatch', { match: result.atsMatch })}</li>}
          <li>{t('cv', { value: result.cvHealth })}</li>
        </ul>
      </div>

      <section aria-labelledby="breakdown" className="rounded-xl border border-border p-5">
        <h2 id="breakdown" className="mb-3 font-semibold">
          {t('breakdown')}
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
          {COMPONENTS.map((key) => (
            <div key={key} className="contents">
              <dt className="text-muted">{t(key)}</dt>
              <dd className="text-right tabular-nums">{number.format(result.breakdown[key])}</dd>
            </div>
          ))}
          <dt className="border-t border-border pt-1 font-semibold">{t('total')}</dt>
          <dd className="border-t border-border pt-1 text-right font-semibold tabular-nums">
            {number.format(result.totalScore)}
          </dd>
        </dl>
        <p className="mt-3 text-xs text-muted">{t('beta')}</p>
      </section>

      <section aria-labelledby="review" className="rounded-xl border border-border p-5">
        <h2 id="review" className="mb-3 font-semibold">
          {t('review')}
        </h2>
        {result.runType === 'ranked' && (
          <p className="mb-3 text-sm text-muted">{t('rankedReview')}</p>
        )}
        <ol className="flex flex-col gap-3">
          {result.review.map((item) => (
            <li key={item.slot} className="flex flex-col gap-1">
              <span>
                <strong>{item.slot}</strong> · {item.prompt}
              </span>
              <span className={item.outcome === 'correct' ? 'text-success' : 'text-muted'}>
                {t(`outcome.${item.outcome}`)}
                {item.selectedOptionText !== undefined &&
                  ` · ${t('yourAnswer', { answer: item.selectedOptionText ?? t('noAnswer') })}`}
                {item.correctOptionText && item.outcome !== 'correct'
                  ? ` · ${t('expected', { answer: item.correctOptionText })}`
                  : ''}
              </span>
              {item.explanation && <span className="text-sm text-muted">{item.explanation}</span>}
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/play"
          className="inline-flex min-h-12 items-center rounded-lg bg-accent px-6 font-semibold text-accent-fg hover:opacity-90"
        >
          {t('playAgain')}
        </Link>
      </div>
    </section>
  );
}
