'use client';

import type { CatalogResponse, Seniority, SeniorityBand } from '@cv-rush/contracts';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api';

/** Display labels for catalog IDs (from the localized catalog) and seniorities (from messages). */
export function useProfileLabels(catalog: CatalogResponse) {
  const t = useTranslations('common');
  const find = (list: { id: string; label: string }[], id: string) =>
    list.find((item) => item.id === id)?.label ?? id;
  const seniority = (value: Seniority) => t(`seniority.${value}`);
  const role = (id: string) => find(catalog.roles, id);
  return {
    seniority,
    role,
    track: (id: string) => find(catalog.tracks, id),
    category: (id: string) => find(catalog.categories, id),
    band: (value: SeniorityBand) => t(`band.${value}`),
    /** "Senior Fullstack Developer" (Spanish keeps the industry's English titles). */
    jobTitle: (value: Seniority, roleId: string) =>
      t('jobTitle', { seniority: seniority(value), role: role(roleId) }),
  };
}

/** Translates API errors by code, turning catalog IDs in their params into labels. */
export function useErrorText(catalog: CatalogResponse) {
  const t = useTranslations('errors');
  const tOnboarding = useTranslations('onboarding');
  const labels = useProfileLabels(catalog);
  return (error: unknown): string => {
    if (!(error instanceof ApiError)) return tOnboarding('networkError');
    const values: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(error.params)) {
      if (typeof value === 'string' || typeof value === 'number') values[key] = value;
    }
    if (typeof values.categoryId === 'string') values.category = labels.category(values.categoryId);
    if (typeof values.minSeniority === 'string') {
      values.minSeniority = labels.seniority(values.minSeniority as Seniority);
    }
    return t(error.code, values);
  };
}
