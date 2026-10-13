import { readCatalogFiles } from '../catalog-files.js';
import { formatIssue } from '../issues.js';
import { validateCatalog } from '../validate-catalog.js';

const { catalog, issues } = validateCatalog(readCatalogFiles());
if (issues.length > 0 || !catalog) {
  issues.forEach((issue) => console.error(formatIssue(issue)));
  console.error(`\n${issues.length} catalog issue(s) found.`);
  process.exit(1);
}
console.log(
  `✓ Catalog valid: ${catalog.roles.length} roles, ${catalog.tracks.length} tracks, ` +
    `${catalog.categories.length} categories, ${catalog.technologies.length} technologies.`,
);
