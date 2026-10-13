'use client';

import type { CatalogResponse, SessionView } from '@cv-rush/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useProfileLabels } from '@/components/onboarding/labels';

const ICONS = { recruiter: '📞', ats: '🤖', hiring_manager: '💼', final: '🏢' } as const;
const STATE_ICONS = { pending: '○', current: '▶', passed: '✓', failed: '✗' } as const;

/** Mode, attempt, competing context, CV Health, score and the four stages of the process. */
export function RunHeader({
  session,
  catalog,
}: {
  session: SessionView;
  catalog: CatalogResponse;
}) {
  const t = useTranslations('run');
  const locale = useLocale();
  const labels = useProfileLabels(catalog);
  const context = session.competingContext;
  const number = new Intl.NumberFormat(locale);
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span
          className={`rounded-full px-3 py-1 font-semibold ${session.runType === 'ranked' ? 'bg-accent text-accent-fg' : 'border border-border'}`}
        >
          {t(`header.${session.runType}`)}
        </span>
        {session.attempt && (
          <span data-testid="attempt">
            {t('header.attempt', { number: session.attempt.number, max: session.attempt.max })}
          </span>
        )}
        <span className="text-muted">
          {context.displayName} · {labels.jobTitle(context.seniority, context.roleId)}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 font-semibold">
        <span data-testid="cv-health">{t('header.cvHealth', { value: session.cvHealth })}</span>
        <span data-testid="score">
          {t('header.score', { value: number.format(session.provisionalScore) })}
        </span>
      </div>
      <ol aria-label={t('progress.label')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {session.progress.map((p) => (
          <li
            key={p.stage}
            aria-current={p.state === 'current' ? 'step' : undefined}
            className={`rounded-lg border px-3 py-2 text-sm ${
              p.state === 'current'
                ? 'border-accent'
                : p.state === 'failed'
                  ? 'border-danger'
                  : 'border-border'
            }`}
          >
            <span className="block font-semibold">
              <span aria-hidden="true">{ICONS[p.stage]} </span>
              {t(`stages.${p.stage}`)}
            </span>
            <span className="text-muted">
              <span aria-hidden="true">{STATE_ICONS[p.state]} </span>
              {t(`progress.${p.state === 'passed' && p.stage !== 'ats' ? 'completed' : p.state}`)}
              {p.total !== undefined && p.state !== 'pending'
                ? ` · ${t('progress.correct', { correct: p.correct ?? 0, total: p.total })}`
                : ''}
              {p.match !== undefined ? ` · ${t('progress.match', { match: p.match })}` : ''}
            </span>
          </li>
        ))}
      </ol>
    </header>
  );
}
