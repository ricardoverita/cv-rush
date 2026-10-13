#!/usr/bin/env node
// Enforces docs/security/dependency-policy.md. Every advisory reported by `pnpm audit` must be
// resolved or covered by a documented exception that is still within its review date and that
// lists every dependency path where the advisory appears. Zero dependencies on purpose.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const { exceptions } = JSON.parse(
  readFileSync(new URL('tools/audit-exceptions.json', root), 'utf8'),
);
const policy = readFileSync(new URL('docs/security/dependency-policy.md', root), 'utf8');
const today = new Date().toISOString().slice(0, 10);

function audit() {
  try {
    return execFileSync('pnpm', ['audit', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // pnpm exits with 1 when it finds advisories; the JSON report is still on stdout.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

const report = JSON.parse(audit());
const advisories = Object.values(report.advisories ?? {});
const byId = new Map(exceptions.map((e) => [e.advisory, e]));
const problems = [];
const seen = new Set();

for (const advisory of advisories) {
  const id = advisory.github_advisory_id;
  const paths = [...new Set(advisory.findings.flatMap((f) => f.paths))];
  const exception = byId.get(id);
  seen.add(id);
  if (!exception) {
    problems.push(
      `${id} (${advisory.severity}) in ${advisory.module_name}: no documented exception.\n    ${advisory.title}\n    via ${paths.join('\n        ')}`,
    );
    continue;
  }
  if (exception.reviewBy < today) {
    problems.push(
      `${id}: the exception expired on ${exception.reviewBy}. Review it (see "removeWhen") and update the date or remove it.`,
    );
  }
  const unexpected = paths.filter((p) => !exception.paths.includes(p));
  if (unexpected.length > 0) {
    problems.push(
      `${id}: appears through paths the exception doesn't cover:\n        ${unexpected.join('\n        ')}`,
    );
  }
  if (!policy.includes(id)) {
    problems.push(
      `${id}: missing from the exceptions table in docs/security/dependency-policy.md.`,
    );
  }
}

for (const exception of exceptions) {
  if (!seen.has(exception.advisory)) {
    console.log(
      `ℹ ${exception.advisory} (${exception.package}) is no longer reported: remove its exception.`,
    );
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  console.error(
    `\n${problems.length} dependency policy problem(s). See docs/security/dependency-policy.md.`,
  );
  process.exit(1);
}
console.log(
  `✓ Dependency audit: ${advisories.length} advisory(ies), all covered by documented, unexpired exceptions.`,
);
