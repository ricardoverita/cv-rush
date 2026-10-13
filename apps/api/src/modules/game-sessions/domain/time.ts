/** UTC day key (YYYY-MM-DD): ranked attempts and daily locks follow UTC days. */
export function utcDayKey(at: Date): string {
  return at.toISOString().slice(0, 10);
}

export function startOfUtcDay(at: Date): Date {
  return new Date(`${utcDayKey(at)}T00:00:00.000Z`);
}

export function endOfUtcDay(at: Date): Date {
  return new Date(startOfUtcDay(at).getTime() + 24 * 60 * 60 * 1000);
}
