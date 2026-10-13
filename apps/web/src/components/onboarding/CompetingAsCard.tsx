'use client';

import type { CatalogResponse, MeResponse } from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { stackChips } from '@/lib/stack';
import { useProfileLabels } from './labels';

/**
 * Who the developer competes as: name, exact seniority and role, stack, and the category the API
 * computed (never computed in the browser). See docs/product/competitive-identity.md §7.
 */
export function CompetingAsCard({
  catalog,
  me,
  onEdit,
}: {
  catalog: CatalogResponse;
  me: MeResponse;
  onEdit: () => void;
}) {
  const t = useTranslations('onboarding.competing');
  const tCommon = useTranslations('common');
  const labels = useProfileLabels(catalog);
  const { profile, developer } = me;
  const { names, more } = stackChips(catalog, profile.technologyIds);

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="competing-as"
        className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-8"
      >
        <p id="competing-as" className="text-sm font-semibold tracking-wide text-accent uppercase">
          {t('title')}
        </p>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold break-words sm:text-4xl">{developer.displayName}</h1>
          <p className="text-xl">{labels.jobTitle(profile.seniority, profile.roleId)}</p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label={labels.role(profile.roleId)}>
          {names.map((name) => (
            <li key={name} className="rounded-full border border-border px-3 py-1 text-sm">
              {name}
            </li>
          ))}
          {more > 0 && (
            <li className="rounded-full px-3 py-1 text-sm text-muted">
              {tCommon('moreTechnologies', { count: more })}
            </li>
          )}
        </ul>
        <dl className="flex flex-wrap gap-x-2 text-muted">
          <dt>{t('category')}:</dt>
          <dd className="font-semibold text-fg">
            {tCommon('category', {
              track: labels.track(profile.category.trackId),
              band: labels.band(profile.category.band),
            })}
          </dd>
        </dl>
        <p className="text-sm text-muted">
          <span aria-hidden="true">🔒 </span>
          {t('private')} · {t('savedOnDevice')}
        </p>
        <div>
          <button
            type="button"
            onClick={onEdit}
            className="min-h-12 rounded-lg border border-border px-5 hover:border-accent"
          >
            {t('edit')}
          </button>
        </div>
      </section>

      <section
        aria-labelledby="next-step"
        className="rounded-xl border border-dashed border-border p-5"
      >
        <h2 id="next-step" className="mb-1 font-semibold">
          {t('nextTitle')}
        </h2>
        <p className="text-muted">{t('nextBody')}</p>
      </section>
    </div>
  );
}
