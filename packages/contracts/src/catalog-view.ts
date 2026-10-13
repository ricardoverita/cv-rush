import { z } from 'zod';
import { SenioritySchema } from './catalog.js';
import { LocaleSchema } from './locales.js';

/** Stable catalog identifiers (`fullstack_developer`, `nodejs`, …). */
export const CatalogIdSchema = z
  .string()
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_]*$/);

const Labelled = z.object({ id: CatalogIdSchema, label: z.string() });

/**
 * `GET /api/v1/catalog?locale=…`: everything the onboarding needs, with labels already
 * resolved for the requested locale. Public and cacheable; `version` changes with the content.
 */
export const CatalogResponseSchema = z.object({
  version: z.string(),
  locale: LocaleSchema,
  seniorities: z.array(SenioritySchema),
  tracks: z.array(Labelled),
  categories: z.array(Labelled),
  technologies: z.array(
    z.object({
      id: CatalogIdSchema,
      name: z.string(),
      categoryId: CatalogIdSchema,
      aliases: z.array(z.string()),
    }),
  ),
  roles: z.array(
    Labelled.extend({
      trackId: CatalogIdSchema,
      minSeniority: SenioritySchema.optional(),
      coreCategoryIds: z.array(CatalogIdSchema),
      allowedCategoryIds: z.array(CatalogIdSchema),
      recommendedTechnologyIds: z.array(CatalogIdSchema),
    }),
  ),
});
export type CatalogResponse = z.infer<typeof CatalogResponseSchema>;
