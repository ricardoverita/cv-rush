import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FALLBACK_LOCALE, LOCALES, NAMESPACES, type MessageTree } from '../catalogs.js';
import { compareCatalogs, type TranslationIssue } from '../validation.js';

const messagesDir = fileURLToPath(new URL('../../messages/', import.meta.url));

function load(locale: string, namespace: string): MessageTree {
  return JSON.parse(
    readFileSync(`${messagesDir}${locale}/${namespace}.json`, 'utf8'),
  ) as MessageTree;
}

const issues: TranslationIssue[] = [];
for (const namespace of NAMESPACES) {
  const reference = load(FALLBACK_LOCALE, namespace);
  for (const locale of LOCALES) {
    if (locale === FALLBACK_LOCALE) continue;
    issues.push(...compareCatalogs(reference, load(locale, namespace), { locale, namespace }));
  }
}

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(
      `✗ [${issue.code}] ${issue.locale}/${issue.namespace}: ${issue.key}${issue.detail ? ` (${issue.detail})` : ''}`,
    );
  }
  console.error(`\n${issues.length} translation issue(s) found.`);
  process.exit(1);
}

console.log(
  `✓ Translations valid: ${LOCALES.length} locales × ${NAMESPACES.length} namespaces (reference: ${FALLBACK_LOCALE}).`,
);
