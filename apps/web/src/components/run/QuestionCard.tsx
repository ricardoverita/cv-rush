'use client';

import type { QuestionView } from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useRemainingMs } from '@/lib/countdown';

const LETTERS = { a: 'A', b: 'B', c: 'C', d: 'D' } as const;

/**
 * The current question: a prompt, four options (also keys 1–4) and the server's deadline. In S3
 * the same choice becomes four paths in the level.
 */
export function QuestionCard({
  question,
  serverTime,
  busy,
  onAnswer,
  onTimeUp,
}: {
  question: QuestionView;
  serverTime: string;
  busy: boolean;
  onAnswer: (optionId: 'a' | 'b' | 'c' | 'd') => void;
  onTimeUp: () => void;
}) {
  const t = useTranslations('run');
  const remaining = useRemainingMs(question.expiresAt, serverTime);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = ['1', '2', '3', '4'].indexOf(event.key);
      const option = question.options[index];
      if (option && !busy) onAnswer(option.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, busy, onAnswer]);

  useEffect(() => {
    if (remaining !== 0) return undefined;
    // The server resolves the timeout on the next request (after its tolerance).
    const timer = setTimeout(onTimeUp, 600);
    return () => clearTimeout(timer);
  }, [remaining, onTimeUp]);

  const share = remaining === null ? 1 : remaining / question.windowMs;
  return (
    <section
      aria-labelledby="question-prompt"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-8"
    >
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {t(`stages.${question.stage}`)} ·{' '}
          {t('question.counter', { index: question.index, total: question.total })}
        </span>
        <span data-testid="time-left">
          {remaining === 0
            ? t('question.timeUp')
            : t('question.timeLeft', { seconds: Math.ceil((remaining ?? 0) / 1000) })}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg" aria-hidden="true">
        <div
          className={`h-full rounded-full ${share < 0.25 ? 'bg-danger' : 'bg-accent'}`}
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </div>
      <h2
        id="question-prompt"
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-bold sm:text-2xl"
        data-testid="question-prompt"
      >
        {question.prompt}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => onAnswer(option.id)}
              disabled={busy || remaining === 0}
              aria-keyshortcuts={String(i + 1)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left hover:border-accent disabled:opacity-50"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg font-bold"
              >
                {LETTERS[option.id]}
              </span>
              <span>
                <span className="sr-only">
                  {t('question.option', { id: LETTERS[option.id] })}:{' '}
                </span>
                {option.text}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
