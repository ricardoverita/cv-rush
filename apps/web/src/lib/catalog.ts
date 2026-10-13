import { type CatalogResponse, CatalogResponseSchema, type Locale } from '@cv-rush/contracts';

/**
 * Loads the public catalog from the API (server side, over the internal network, with no
 * credentials). Returns null when the API is unavailable, so pages can say so instead of failing.
 */
export async function fetchCatalog(
  baseUrl: string,
  locale: Locale,
  fetchImpl: typeof fetch = fetch,
): Promise<CatalogResponse | null> {
  try {
    const response = await fetchImpl(`${baseUrl}/api/v1/catalog?locale=${locale}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const parsed = CatalogResponseSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
