import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  type CatalogResponse,
  type CatalogRules,
  type Locale,
  SENIORITIES,
  SUPPORTED_LOCALES,
} from '@cv-rush/contracts';
import { type Catalog, formatIssue, readCatalogFiles, validateCatalog } from '@cv-rush/content';

/**
 * The catalog (roles, tracks, technology categories, technologies) from `packages/content`,
 * validated at boot: the API refuses to start with invalid content.
 */
@Injectable()
export class CatalogService {
  private readonly catalog: Catalog;
  private readonly views: Map<Locale, CatalogResponse>;
  readonly version: string;

  constructor() {
    const { catalog, issues } = validateCatalog(readCatalogFiles());
    if (!catalog || issues.length > 0) {
      throw new Error(`Invalid catalog content:\n${issues.map(formatIssue).join('\n')}`);
    }
    this.catalog = catalog;
    this.version = createHash('sha256').update(JSON.stringify(catalog)).digest('hex').slice(0, 12);
    this.views = new Map(SUPPORTED_LOCALES.map((locale) => [locale, this.buildView(locale)]));
  }

  /** The catalog with labels resolved for a locale (public, cacheable). */
  view(locale: Locale): CatalogResponse {
    return this.views.get(locale) as CatalogResponse;
  }

  /** The validated catalog content (labels in every locale). */
  content(): Catalog {
    return this.catalog;
  }

  /** What the profile rules need. Locale-independent. */
  rules(): CatalogRules {
    return this.view('en');
  }

  trackOf(roleId: string): string | undefined {
    return this.catalog.roles.find((role) => role.id === roleId)?.track;
  }

  private buildView(locale: Locale): CatalogResponse {
    const { tracks, categories, technologies, roles } = this.catalog;
    return {
      version: this.version,
      locale,
      seniorities: [...SENIORITIES],
      tracks: tracks.map((t) => ({ id: t.id, label: t.labels[locale] })),
      categories: categories.map((c) => ({ id: c.id, label: c.labels[locale] })),
      technologies: technologies.map((t) => ({
        id: t.id,
        name: t.name,
        categoryId: t.category,
        aliases: t.aliases ?? [],
      })),
      roles: roles.map((r) => ({
        id: r.id,
        label: r.labels[locale],
        trackId: r.track,
        ...(r.minSeniority ? { minSeniority: r.minSeniority } : {}),
        coreCategoryIds: r.coreCategories,
        allowedCategoryIds: r.allowedCategories,
        recommendedTechnologyIds: r.recommended,
      })),
    };
  }
}
