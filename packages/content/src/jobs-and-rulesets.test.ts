import { describe, expect, it } from 'vitest';
import { readCatalogFiles } from './catalog-files.js';
import { readJobsFiles, validateJobsContent } from './jobs.js';
import { checkRuleset, readRuleset } from './ruleset.js';
import { validateCatalog } from './validate-catalog.js';

const { catalog } = validateCatalog(readCatalogFiles());
if (!catalog) throw new Error('catalog fixture is invalid');
const trackIds = new Set(catalog.tracks.map((t) => t.id));

describe('job generation content', () => {
  it('accepts the repository content', () => {
    const { content, issues } = validateJobsContent(readJobsFiles(), catalog);
    expect(issues).toEqual([]);
    expect(content?.locations.locations.length).toBeGreaterThanOrEqual(10);
  });

  it('reports missing bands, unknown tiers and option-sized texts that are too long', () => {
    const input = readJobsFiles();
    const locations = structuredClone(input.locations) as {
      locations: { tier: string; labels: { en: string } }[];
    };
    locations.locations[0]!.tier = 'atlantis';
    locations.locations[1]!.labels.en = 'A city with a name far longer than forty characters';
    const salaryBands = structuredClone(input.salaryBands) as {
      bands: Record<string, Record<string, unknown>>;
    };
    delete salaryBands.bands.spain!.senior;
    const { issues } = validateJobsContent({ ...input, locations, salaryBands }, catalog);
    expect(issues.map((i) => i.code).sort()).toEqual(
      ['MISSING_BAND', 'OPTION_TOO_LONG', 'UNKNOWN_TIER'].sort(),
    );
  });
});

describe('rulesets', () => {
  it('reads and checks ruleset-v0', () => {
    const ruleset = readRuleset('ruleset-v0');
    expect(ruleset.ranked.attemptsPerDay).toBe(3);
    expect(checkRuleset(ruleset, 'ruleset-v0', trackIds)).toEqual([]);
  });

  it('rejects inconsistent rulesets', () => {
    const ruleset = structuredClone(readRuleset('ruleset-v0'));
    ruleset.scoring.weights.answers += 1;
    ruleset.ranked.tracks.wizardry = 'official';
    ruleset.stages.final[0]!.slot = 'H1';
    expect(
      checkRuleset(ruleset, 'x', trackIds)
        .map((i) => i.code)
        .sort(),
    ).toEqual(['DUPLICATE_SLOT', 'MISSING_SLOT', 'SCORING_TOTAL', 'UNKNOWN_TRACK'].sort());
  });
});
