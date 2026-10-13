// Display-name moderation (docs/product/public-profile-and-privacy.md §6). Server-side only.
// Kept deliberately short: it catches the obvious cases; reports and admin hiding cover the rest.
// Terms are compared after folding (lowercase, no diacritics), so "Pútá" matches "puta".

/** Whole names that would impersonate the project, its staff or the anonymous display. */
const RESERVED_NAMES = new Set([
  'admin',
  'administrator',
  'administrador',
  'moderator',
  'moderador',
  'mod',
  'support',
  'soporte',
  'system',
  'sistema',
  'root',
  'official',
  'oficial',
  'cvrush',
  'cvrushteam',
  'anonymous',
  'anonymouscandidate',
  'anonimo',
  'anonima',
  'candidatoanonimo',
  'candidataanonima',
]);

/** Offensive words, matched as whole words (substrings would block names like "Cassandra"). */
const BLOCKED_WORDS = new Set([
  // en
  'fuck',
  'fucker',
  'fucking',
  'shit',
  'bitch',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'whore',
  'slut',
  'asshole',
  'bastard',
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  'rapist',
  'nazi',
  'hitler',
  // es
  'puta',
  'puto',
  'mierda',
  'joder',
  'pendejo',
  'pendeja',
  'cabron',
  'cabrona',
  'maricon',
  'polla',
  'verga',
  'chingada',
  'culero',
  'zorra',
  'gilipollas',
  'hijueputa',
  'malparido',
]);

/** Unambiguous terms that are blocked even inside other words ("xfuckx", "hitlerfan"). */
const BLOCKED_FRAGMENTS = ['fuck', 'nigger', 'faggot', 'hitler', 'hijueputa', 'gilipollas'];

function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function isBlockedDisplayName(normalizedName: string): boolean {
  const words = fold(normalizedName)
    .split(/[^\p{L}]+/u)
    .filter(Boolean);
  const compact = words.join('');
  if (RESERVED_NAMES.has(compact)) return true;
  if (words.some((word) => BLOCKED_WORDS.has(word))) return true;
  return BLOCKED_FRAGMENTS.some((fragment) => compact.includes(fragment));
}
