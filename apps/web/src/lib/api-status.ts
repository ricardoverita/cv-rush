import { HealthResponseSchema } from '@cv-rush/contracts';

export type ApiStatus = 'online' | 'offline';

/** Calls the API's liveness endpoint from the server. Never throws. */
export async function fetchApiStatus(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 1500,
): Promise<ApiStatus> {
  try {
    const response = await fetchImpl(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (!response.ok) return 'offline';
    return HealthResponseSchema.safeParse(await response.json()).success ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}
