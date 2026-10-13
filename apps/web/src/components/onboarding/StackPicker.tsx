'use client';

import { type CatalogResponse, STACK_LIMITS } from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import { searchTechnologies, technologiesForRole } from '@/lib/stack';
import { useProfileLabels } from './labels';

type Role = CatalogResponse['roles'][number];
type Technology = CatalogResponse['technologies'][number];

interface StackPickerProps {
  catalog: CatalogResponse;
  role: Role;
  technologyIds: string[];
  onChange: (technologyIds: string[]) => void;
}

/**
 * Never shows the whole catalog at once (docs/product/player-journey §2.1): the selection, the
 * role's requirements, a search with aliases, the role's recommendations, then its categories.
 */
export function StackPicker({ catalog, role, technologyIds, onChange }: StackPickerProps) {
  const t = useTranslations('onboarding.stack');
  const labels = useProfileLabels(catalog);
  const [query, setQuery] = useState('');
  const searchId = useId();

  const allowed = useMemo(() => technologiesForRole(catalog, role), [catalog, role]);
  const byId = useMemo(() => new Map(allowed.map((tech) => [tech.id, tech])), [allowed]);
  const selected = new Set(technologyIds);
  const atLimit = technologyIds.length >= STACK_LIMITS.max;
  const results = searchTechnologies(allowed, query);
  const recommended = role.recommendedTechnologyIds.flatMap((id) => byId.get(id) ?? []);
  const categoryIds = [...role.coreCategoryIds, ...role.allowedCategoryIds];

  const toggle = (id: string) => {
    if (selected.has(id)) onChange(technologyIds.filter((other) => other !== id));
    else if (!atLimit) onChange([...technologyIds, id]);
  };

  const chips = (technologies: Technology[]) => (
    <ul className="flex flex-wrap gap-2">
      {technologies.map((tech) => (
        <li key={tech.id}>
          <TechChip
            name={tech.name}
            pressed={selected.has(tech.id)}
            disabled={!selected.has(tech.id) && atLimit}
            onToggle={() => toggle(tech.id)}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={t('selected')} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-semibold">{t('selected')}</h3>
          <p className="text-sm text-muted" aria-live="polite">
            {t('count', { count: technologyIds.length, max: STACK_LIMITS.max })}
          </p>
        </div>
        {technologyIds.length === 0 ? (
          <p className="text-sm text-muted">{t('empty')}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {technologyIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={t('remove', { name: byId.get(id)?.name ?? id })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg"
                >
                  {byId.get(id)?.name ?? id}
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <ul className="flex flex-col gap-1 text-sm">
          {role.coreCategoryIds.map((categoryId) => {
            const met = technologyIds.some((id) => byId.get(id)?.categoryId === categoryId);
            return (
              <li key={categoryId} className={met ? 'text-success' : 'text-muted'}>
                <span aria-hidden="true">{met ? '✓ ' : '○ '}</span>
                {t('requirement', { category: labels.category(categoryId) })}
              </li>
            );
          })}
        </ul>
        {atLimit && (
          <p className="text-sm text-muted" role="status">
            {t('limit', { max: STACK_LIMITS.max })}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <label htmlFor={searchId} className="font-semibold">
          {t('search')}
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          className="min-h-11 rounded-lg border border-border bg-bg px-3"
        />
        {query.trim() !== '' &&
          (results.length > 0 ? (
            chips(results)
          ) : (
            <p className="text-sm text-muted">{t('noResults', { query: query.trim() })}</p>
          ))}
      </section>

      {recommended.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold">{t('recommended', { role: labels.role(role.id) })}</h3>
          {chips(recommended)}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">{t('categories')}</h3>
        {categoryIds.map((categoryId) => {
          const inCategory = allowed.filter((tech) => tech.categoryId === categoryId);
          if (inCategory.length === 0) return null;
          const count = inCategory.filter((tech) => selected.has(tech.id)).length;
          return (
            <details key={categoryId} className="rounded-lg border border-border px-4 py-2">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between">
                <span>{labels.category(categoryId)}</span>
                {count > 0 && <span className="text-sm text-muted">{count}</span>}
              </summary>
              <div className="pt-2 pb-3">{chips(inCategory)}</div>
            </details>
          );
        })}
      </section>
    </div>
  );
}

function TechChip({
  name,
  pressed,
  disabled,
  onToggle,
}: {
  name: string;
  pressed: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onToggle}
      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${
        pressed
          ? 'border-accent bg-accent font-semibold text-accent-fg'
          : 'border-border hover:border-accent disabled:cursor-not-allowed disabled:opacity-40'
      }`}
    >
      {pressed && (
        <span aria-hidden="true" className="mr-1">
          ✓
        </span>
      )}
      {name}
    </button>
  );
}
