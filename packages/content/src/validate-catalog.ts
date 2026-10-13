import type { z } from 'zod';
import type { ContentIssue } from './issues.js';
import {
  CategoriesFileSchema,
  RolesFileSchema,
  TechnologiesFileSchema,
  TracksFileSchema,
  type CategoriesFile,
  type RolesFile,
  type TechnologiesFile,
  type TracksFile,
} from './schemas.js';

export interface CatalogInput {
  tracks: unknown;
  categories: unknown;
  technologies: unknown;
  roles: unknown;
}

export interface Catalog {
  tracks: TracksFile['tracks'];
  categories: CategoriesFile['categories'];
  technologies: TechnologiesFile['technologies'];
  roles: RolesFile['roles'];
}

function parse<S extends z.ZodType>(
  schema: S,
  data: unknown,
  file: string,
  issues: ContentIssue[],
): z.infer<S> | undefined {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    issues.push({ code: 'SCHEMA_INVALID', file, at: issue.path.join('.'), message: issue.message });
  }
  return undefined;
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) (seen.has(v) ? dup : seen).add(v);
  return [...dup];
}

export function validateCatalog(input: CatalogInput): {
  catalog?: Catalog;
  issues: ContentIssue[];
} {
  const issues: ContentIssue[] = [];
  const tracks = parse(TracksFileSchema, input.tracks, 'catalog/tracks.yaml', issues);
  const categories = parse(
    CategoriesFileSchema,
    input.categories,
    'catalog/technology-categories.yaml',
    issues,
  );
  const technologies = parse(
    TechnologiesFileSchema,
    input.technologies,
    'catalog/technologies.yaml',
    issues,
  );
  const roles = parse(RolesFileSchema, input.roles, 'catalog/roles.yaml', issues);
  if (!tracks || !categories || !technologies || !roles) return { issues };

  const trackIds = new Set(tracks.tracks.map((t) => t.id));
  const categoryIds = new Set(categories.categories.map((c) => c.id));
  const techById = new Map(technologies.technologies.map((t) => [t.id, t]));

  for (const id of duplicates(tracks.tracks.map((t) => t.id)))
    issues.push({
      code: 'DUPLICATE_ID',
      file: 'catalog/tracks.yaml',
      at: id,
      message: 'duplicate track id',
    });
  for (const id of duplicates(categories.categories.map((c) => c.id)))
    issues.push({
      code: 'DUPLICATE_ID',
      file: 'catalog/technology-categories.yaml',
      at: id,
      message: 'duplicate category id',
    });
  for (const id of duplicates(technologies.technologies.map((t) => t.id)))
    issues.push({
      code: 'DUPLICATE_ID',
      file: 'catalog/technologies.yaml',
      at: id,
      message: 'duplicate technology id',
    });
  for (const id of duplicates(roles.roles.map((r) => r.id)))
    issues.push({
      code: 'DUPLICATE_ID',
      file: 'catalog/roles.yaml',
      at: id,
      message: 'duplicate role id',
    });

  // Search terms (ids, names and aliases) must not collide across technologies.
  const owners = new Map<string, string>();
  for (const tech of technologies.technologies) {
    if (!categoryIds.has(tech.category)) {
      issues.push({
        code: 'UNKNOWN_CATEGORY',
        file: 'catalog/technologies.yaml',
        at: tech.id,
        message: `unknown category "${tech.category}"`,
      });
    }
    for (const term of [tech.id, tech.name, ...(tech.aliases ?? [])].map((t) => t.toLowerCase())) {
      const owner = owners.get(term);
      if (owner && owner !== tech.id) {
        issues.push({
          code: 'ALIAS_COLLISION',
          file: 'catalog/technologies.yaml',
          at: tech.id,
          message: `"${term}" is already used by "${owner}"`,
        });
      }
      owners.set(term, tech.id);
    }
  }

  for (const role of roles.roles) {
    const file = 'catalog/roles.yaml';
    if (!trackIds.has(role.track))
      issues.push({
        code: 'UNKNOWN_TRACK',
        file,
        at: role.id,
        message: `unknown track "${role.track}"`,
      });
    const allowed = new Set([...role.coreCategories, ...role.allowedCategories]);
    for (const category of allowed) {
      if (!categoryIds.has(category))
        issues.push({
          code: 'UNKNOWN_CATEGORY',
          file,
          at: role.id,
          message: `unknown category "${category}"`,
        });
    }
    for (const techId of role.recommended) {
      const tech = techById.get(techId);
      if (!tech)
        issues.push({
          code: 'UNKNOWN_TECHNOLOGY',
          file,
          at: role.id,
          message: `unknown technology "${techId}"`,
        });
      else if (!allowed.has(tech.category)) {
        issues.push({
          code: 'TECHNOLOGY_NOT_ALLOWED',
          file,
          at: role.id,
          message: `"${techId}" (${tech.category}) is not in the role's categories`,
        });
      }
    }
  }

  return {
    catalog: {
      tracks: tracks.tracks,
      categories: categories.categories,
      technologies: technologies.technologies,
      roles: roles.roles,
    },
    issues,
  };
}
