import { describe, expect, it } from 'vitest';
import { readCatalogFiles } from './catalog-files.js';
import { validateCatalog } from './validate-catalog.js';

const labels = { en: 'X', es: 'X' };

describe('validateCatalog', () => {
  it('accepts the repository catalog', () => {
    const { catalog, issues } = validateCatalog(readCatalogFiles());
    expect(issues).toEqual([]);
    expect(catalog?.roles.length).toBe(13);
  });

  it('reports unknown references and alias collisions', () => {
    const { issues } = validateCatalog({
      tracks: { tracks: [{ id: 'backend', labels }] },
      categories: { categories: [{ id: 'backend', labels }] },
      technologies: {
        technologies: [
          { id: 'nodejs', name: 'Node.js', category: 'backend', aliases: ['node'] },
          { id: 'deno', name: 'Deno', category: 'runtimes', aliases: ['node'] },
        ],
      },
      roles: {
        roles: [
          {
            id: 'backend_developer',
            track: 'servers',
            labels,
            coreCategories: ['backend'],
            allowedCategories: [],
            recommended: ['nodejs', 'cobol'],
          },
        ],
      },
    });
    expect(issues.map((i) => i.code).sort()).toEqual(
      ['ALIAS_COLLISION', 'UNKNOWN_CATEGORY', 'UNKNOWN_TECHNOLOGY', 'UNKNOWN_TRACK'].sort(),
    );
  });
});
