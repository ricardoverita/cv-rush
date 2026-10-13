import { readCatalogFiles } from '../catalog-files.js';
import { formatIssue, type ContentIssue } from '../issues.js';
import { readJobsFiles, validateJobsContent } from '../jobs.js';
import { readYaml } from '../load.js';
import { checkRuleset, listRulesets, RULESETS_DIR, RulesetSchema } from '../ruleset.js';
import { validateCatalog } from '../validate-catalog.js';

const { catalog, issues } = validateCatalog(readCatalogFiles());
if (issues.length > 0 || !catalog) {
  issues.forEach((issue) => console.error(formatIssue(issue)));
  console.error(`\n${issues.length} catalog issue(s) found.`);
  process.exit(1);
}

const jobs = validateJobsContent(readJobsFiles(), catalog);
const rulesetIssues: ContentIssue[] = [];
const trackIds = new Set(catalog.tracks.map((t) => t.id));
const rulesets = listRulesets();
for (const version of rulesets) {
  const file = `rulesets/${version}.yaml`;
  const parsed = RulesetSchema.safeParse(readYaml(`${RULESETS_DIR}${version}.yaml`));
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      rulesetIssues.push({
        code: 'SCHEMA_INVALID',
        file,
        at: issue.path.join('.'),
        message: issue.message,
      });
    }
    continue;
  }
  if (parsed.data.version !== version) {
    rulesetIssues.push({ code: 'VERSION_MISMATCH', file, message: `version must be "${version}"` });
  }
  rulesetIssues.push(...checkRuleset(parsed.data, file, trackIds));
}

const all = [...jobs.issues, ...rulesetIssues];
if (all.length > 0) {
  all.forEach((issue) => console.error(formatIssue(issue)));
  console.error(`\n${all.length} content issue(s) found.`);
  process.exit(1);
}
console.log(
  `✓ Catalog valid: ${catalog.roles.length} roles, ${catalog.tracks.length} tracks, ` +
    `${catalog.categories.length} categories, ${catalog.technologies.length} technologies.`,
);
console.log(
  `✓ Job content valid: ${jobs.content?.locations.locations.length} locations, ` +
    `${jobs.content?.companies.sectors.length} sectors, ${jobs.content?.fragments.perks.length} perks.`,
);
console.log(`✓ Rulesets valid: ${rulesets.join(', ')}.`);
