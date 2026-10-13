'use client';

import type { CatalogResponse, MeResponse } from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { CompetingAsCard } from './CompetingAsCard';
import { OnboardingWizard } from './OnboardingWizard';

type State =
  | { kind: 'loading' }
  | { kind: 'onboarding' }
  | { kind: 'ready'; me: MeResponse }
  | { kind: 'editing'; me: MeResponse }
  | { kind: 'offline' };

/**
 * `/play`: a recognised device sees who it competes as; a new one goes through onboarding.
 * The device credential is an httpOnly cookie, so only the API can tell which case this is.
 */
export function PlayExperience({ catalog }: { catalog: CatalogResponse }) {
  const t = useTranslations('onboarding');
  const [state, setState] = useState<State>({ kind: 'loading' });

  const load = useCallback(() => {
    api.me().then(
      (me) => setState({ kind: 'ready', me }),
      (error: unknown) =>
        setState(
          error instanceof ApiError && error.status === 401
            ? { kind: 'onboarding' }
            : { kind: 'offline' },
        ),
    );
  }, []);

  useEffect(load, [load]);

  switch (state.kind) {
    case 'loading':
      return (
        <p className="py-12 text-muted" role="status">
          {t('loading')}
        </p>
      );
    case 'offline':
      return (
        <div role="alert" className="flex flex-col items-start gap-4 py-12">
          <p>{t('networkError')}</p>
          <button
            type="button"
            onClick={() => {
              setState({ kind: 'loading' });
              load();
            }}
            className="min-h-12 rounded-lg border border-border px-5 hover:border-accent"
          >
            {t('next')}
          </button>
        </div>
      );
    case 'onboarding':
      return (
        <OnboardingWizard catalog={catalog} onDone={(me) => setState({ kind: 'ready', me })} />
      );
    case 'editing':
      return (
        <OnboardingWizard
          catalog={catalog}
          initial={state.me}
          onDone={(me) => setState({ kind: 'ready', me })}
          onCancel={() => setState({ kind: 'ready', me: state.me })}
        />
      );
    case 'ready':
      return (
        <CompetingAsCard
          catalog={catalog}
          me={state.me}
          onEdit={() => setState({ kind: 'editing', me: state.me })}
        />
      );
  }
}
