import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

/** Absolute path to the package's `data/` directory. */
export const DATA_DIR = fileURLToPath(new URL('../data/', import.meta.url));

export interface LoadedFile {
  /** Path relative to the data directory, for readable messages. */
  file: string;
  data: unknown;
}

export function readYaml(path: string): unknown {
  return parse(readFileSync(path, 'utf8'));
}

/** Recursively loads every .yaml/.yml file under a directory. */
export function loadYamlTree(root: string, base = DATA_DIR): LoadedFile[] {
  const files: LoadedFile[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.ya?ml$/.test(entry))
        files.push({ file: relative(base, path), data: readYaml(path) });
    }
  };
  walk(root);
  return files;
}
