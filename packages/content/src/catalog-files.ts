import { join } from 'node:path';
import { DATA_DIR, readYaml } from './load.js';
import type { CatalogInput } from './validate-catalog.js';

export function readCatalogFiles(dataDir = DATA_DIR): CatalogInput {
  const catalog = join(dataDir, 'catalog');
  return {
    tracks: readYaml(join(catalog, 'tracks.yaml')),
    categories: readYaml(join(catalog, 'technology-categories.yaml')),
    technologies: readYaml(join(catalog, 'technologies.yaml')),
    roles: readYaml(join(catalog, 'roles.yaml')),
  };
}
