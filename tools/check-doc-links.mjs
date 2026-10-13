#!/usr/bin/env node
// Checks relative links and #anchors in every Markdown file of the repository (no dependencies).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const ignored = new Set(['node_modules', '.git', 'dist', '.next', 'coverage']);
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.md')) files.push(full);
  }
};
walk(root);

// GitHub-style heading slugs.
const slug = (heading) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');

const anchorsCache = new Map();
const anchorsOf = (file) => {
  if (!anchorsCache.has(file)) {
    const set = new Set();
    let inCode = false;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (line.startsWith('```')) inCode = !inCode;
      const match = !inCode && /^#{1,6}\s+(.*)$/.exec(line);
      if (match) set.add(slug(match[1]));
    }
    anchorsCache.set(file, set);
  }
  return anchorsCache.get(file);
};

const problems = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, link] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(link)) continue;
    const [target, anchor] = link.split('#');
    const resolved = target ? path.resolve(path.dirname(file), target) : file;
    if (!fs.existsSync(resolved)) {
      problems.push(`${path.relative(root, file)} → ${link} (missing file)`);
    } else if (anchor && resolved.endsWith('.md') && !anchorsOf(resolved).has(anchor)) {
      problems.push(`${path.relative(root, file)} → ${link} (missing anchor)`);
    }
  }
}

if (problems.length > 0) {
  problems.forEach((p) => console.error(`✗ ${p}`));
  console.error(`\n${problems.length} broken link(s) in ${files.length} Markdown files.`);
  process.exit(1);
}
console.log(`✓ Documentation links valid: ${files.length} Markdown files.`);
