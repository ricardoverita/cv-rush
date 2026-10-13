'use client';

import type { AtsView } from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRemainingMs } from '@/lib/countdown';

/**
 * The ATS 9000 as HTML: pick the job's keywords among traps. The server knows which ones are
 * relevant and computes the match; in S4 this becomes the keyword conveyor belt.
 */
export function AtsPanel({
  ats,
  serverTime,
  busy,
  onSubmit,
  onTimeUp,
}: {
  ats: AtsView;
  serverTime: string;
  busy: boolean;
  onSubmit: (tokenIds: string[]) => void;
  onTimeUp: () => void;
}) {
  const t = useTranslations('run');
  const [selected, setSelected] = useState<string[]>([]);
  const remaining = useRemainingMs(ats.expiresAt, serverTime);

  useEffect(() => {
    if (remaining !== 0) return undefined;
    const timer = setTimeout(onTimeUp, 600);
    return () => clearTimeout(timer);
  }, [remaining, onTimeUp]);

  const toggle = (id: string) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <section
      aria-labelledby="ats-title"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 id="ats-title" className="text-xl font-bold">
          <span aria-hidden="true">🤖 </span>
          {t('ats.title')}
        </h2>
        <span className="text-sm text-muted" data-testid="time-left">
          {remaining === 0
            ? t('question.timeUp')
            : t('question.timeLeft', { seconds: Math.ceil((remaining ?? 0) / 1000) })}
        </span>
      </div>
      <p>{t('ats.instructions')}</p>
      <p className="text-sm text-muted">
        {t('ats.threshold', { threshold: ats.threshold })} ·{' '}
        {t('ats.selected', { count: selected.length })}
      </p>
      <ul className="flex flex-wrap gap-2">
        {ats.tokens.map((token) => {
          const on = selected.includes(token.id);
          return (
            <li key={token.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(token.id)}
                disabled={busy || remaining === 0}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${
                  on
                    ? 'border-accent bg-accent font-semibold text-accent-fg'
                    : 'border-border hover:border-accent'
                }`}
              >
                {on && (
                  <span aria-hidden="true" className="mr-1">
                    ✓
                  </span>
                )}
                {token.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div>
        <button
          type="button"
          onClick={() => onSubmit(selected)}
          disabled={busy || remaining === 0}
          className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-fg hover:opacity-90 disabled:opacity-40"
        >
          {t('ats.submit')}
        </button>
      </div>
    </section>
  );
}
