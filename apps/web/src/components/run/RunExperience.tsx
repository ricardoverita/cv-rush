'use client';

import type {
  AnswerResponse,
  AtsResponse,
  CatalogResponse,
  ChallengeStage,
  SessionView,
} from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useErrorText } from '@/components/onboarding/labels';
import { api, ApiError } from '@/lib/api';
import { AtsPanel } from './AtsPanel';
import { JobOffer } from './JobOffer';
import { QuestionCard } from './QuestionCard';
import { ResultScreen } from './ResultScreen';
import { RunHeader } from './RunHeader';

type Feedback =
  | { kind: 'answer'; outcome: AnswerResponse['outcome'] }
  | { kind: 'ats'; outcome: AtsResponse['outcome'] };

/**
 * One run, rendered from the server's state (docs/architecture/13). The page holds no rules: it
 * shows what the API returns and sends the player's choices. Refreshing reloads the same state.
 * In slice S3 the question and ATS steps move into the Phaser game; this flow stays the same.
 */
export function RunExperience({
  sessionId,
  catalog,
}: {
  sessionId: string;
  catalog: CatalogResponse;
}) {
  const t = useTranslations('run');
  const errorText = useErrorText(catalog);
  const [session, setSession] = useState<SessionView | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.session(sessionId).then(
      (view) => {
        setSession(view);
        setError(null);
      },
      (e: unknown) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
        else setError(errorText(e));
      },
    );
    // errorText only translates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(load, [load]);

  const act = async (action: () => Promise<SessionView>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setSession(await action());
    } catch (e) {
      setError(errorText(e));
      load();
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <p role="alert" className="py-12">
        {t('errors.notFound')}
      </p>
    );
  }
  if (!session) {
    return error ? (
      <div role="alert" className="flex flex-col items-start gap-3 py-12">
        <p>{error}</p>
        <button type="button" onClick={load} className="rounded-lg border border-border px-4 py-2">
          {t('errors.retry')}
        </button>
      </div>
    ) : (
      <p role="status" className="py-12 text-muted">
        …
      </p>
    );
  }

  const start = (stage: ChallengeStage) => {
    setFeedback(null);
    void act(() => api.startChallenge(session.id, stage));
  };
  const answer = (optionId: 'a' | 'b' | 'c' | 'd') => {
    const question = session.question;
    if (!question) return;
    void act(async () => {
      const response = await api.answer(session.id, question.challengeId, {
        questionAttemptId: question.questionAttemptId,
        selectedOptionId: optionId,
      });
      setFeedback({ kind: 'answer', outcome: response.outcome });
      return response.session;
    });
  };
  const submitAts = (tokenIds: string[]) => {
    const ats = session.ats;
    if (!ats) return;
    void act(async () => {
      const response = await api.submitAts(session.id, ats.challengeId, {
        selectedTokenIds: tokenIds,
      });
      setFeedback({ kind: 'ats', outcome: response.outcome });
      return response.session;
    });
  };

  const terminal = session.result !== null;
  return (
    <div className="flex flex-col gap-6">
      <RunHeader session={session} catalog={catalog} />

      {feedback && !terminal && <FeedbackBanner feedback={feedback} />}

      {error && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-danger">
          {error}
        </p>
      )}

      {session.status === 'created' && (
        <JobOffer
          session={session}
          catalog={catalog}
          busy={busy}
          onApply={() => void act(() => api.apply(session.id))}
          onExpired={load}
        />
      )}

      {session.status === 'expired_unstarted' && (
        <p role="status" className="rounded-xl border border-border bg-surface p-5">
          {t('job.expired')}
        </p>
      )}

      {session.status === 'in_progress' && session.nextChallenge && (
        <section
          aria-labelledby="next-stage"
          className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-5"
        >
          <h2 id="next-stage" className="text-xl font-bold">
            {t('segment.next', { stage: t(`stages.${session.nextChallenge}`) })}
          </h2>
          <p className="text-muted">{t(`segment.intro.${session.nextChallenge}`)}</p>
          <button
            type="button"
            onClick={() => start(session.nextChallenge as ChallengeStage)}
            disabled={busy}
            className="min-h-12 rounded-lg bg-accent px-6 font-semibold text-accent-fg hover:opacity-90 disabled:opacity-40"
          >
            {t('segment.continue', { stage: t(`stages.${session.nextChallenge}`) })}
          </button>
        </section>
      )}

      {session.status === 'in_progress' && session.question && (
        <QuestionCard
          key={session.question.questionAttemptId}
          question={session.question}
          serverTime={session.serverTime}
          busy={busy}
          onAnswer={answer}
          onTimeUp={load}
        />
      )}

      {session.status === 'in_progress' && session.ats && (
        <AtsPanel
          key={session.ats.challengeId}
          ats={session.ats}
          serverTime={session.serverTime}
          busy={busy}
          onSubmit={submitAts}
          onTimeUp={load}
        />
      )}

      {session.result && <ResultScreen session={session} catalog={catalog} />}
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  const t = useTranslations('run');
  if (feedback.kind === 'ats') {
    const { outcome } = feedback;
    return (
      <p
        role="status"
        className={`rounded-lg border px-4 py-3 font-semibold ${outcome.passed ? 'border-success text-success' : 'border-danger text-danger'}`}
      >
        {outcome.passed
          ? t('ats.approved', { match: outcome.match })
          : t('ats.rejected', { match: outcome.match })}
      </p>
    );
  }
  const { outcome } = feedback;
  const damage = outcome.effects.find((e) => e.code === 'CV_DAMAGE')?.value;
  const label = outcome.timedOut
    ? t('feedback.timeout')
    : outcome.correct
      ? t('feedback.correct')
      : t('feedback.incorrect');
  return (
    <p
      role="status"
      data-testid="answer-feedback"
      className={`flex flex-wrap gap-x-4 rounded-lg border px-4 py-3 ${outcome.correct ? 'border-success' : 'border-danger'}`}
    >
      <strong className={outcome.correct ? 'text-success' : 'text-danger'}>
        <span aria-hidden="true">{outcome.correct ? '✓ ' : '✗ '}</span>
        {label}
      </strong>
      {outcome.points > 0 && <span>{t('feedback.points', { points: outcome.points })}</span>}
      {outcome.combo > 1 && <span>{t('feedback.combo', { combo: outcome.combo })}</span>}
      {damage && <span className="text-danger">{t('feedback.cvDamage', { value: damage })}</span>}
    </p>
  );
}
