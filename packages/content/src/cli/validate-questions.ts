import { join } from 'node:path';
import { readCatalogFiles } from '../catalog-files.js';
import { formatIssue } from '../issues.js';
import { DATA_DIR, loadYamlTree } from '../load.js';
import { validateCatalog } from '../validate-catalog.js';
import { validateQuestionPacks } from '../validate-questions.js';

const { catalog, issues: catalogIssues } = validateCatalog(readCatalogFiles());
if (!catalog || catalogIssues.length > 0) {
  catalogIssues.forEach((issue) => console.error(formatIssue(issue)));
  console.error('\nThe catalog is invalid; fix it first (pnpm content:validate).');
  process.exit(1);
}

const packs = loadYamlTree(join(DATA_DIR, 'questions'));
const result = validateQuestionPacks(packs, new Set(catalog.technologies.map((t) => t.id)));
if (result.issues.length > 0) {
  result.issues.forEach((issue) => console.error(formatIssue(issue)));
  console.error(`\n${result.issues.length} question issue(s) found.`);
  process.exit(1);
}
console.log(`✓ Questions valid: ${result.questions} question(s) in ${result.packs} pack(s).`);
