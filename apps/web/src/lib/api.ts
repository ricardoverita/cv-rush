import {
  type CreateDeveloperRequest,
  type ErrorCode,
  ErrorEnvelopeSchema,
  MeResponseSchema,
  type UpdateProfileRequest,
} from '@cv-rush/contracts';
import type { z } from 'zod';

/** A failed API call, identified by its semantic code (translated through the `errors` namespace). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    readonly params: Record<string, unknown> = {},
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

/** The browser couldn't reach the API at all. */
export class NetworkError extends Error {
  constructor() {
    super('NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Calls the API on the same origin (`/api/v1`), with the device cookie and the client header the
 * API's CSRF check requires. Responses are validated with the shared contracts.
 */
export async function apiRequest<S extends z.ZodType>(
  path: string,
  schema: S,
  init: { method?: string; body?: unknown } = {},
  fetchImpl: typeof fetch = fetch,
): Promise<z.infer<S>> {
  let response: Response;
  try {
    response = await fetchImpl(`/api/v1${path}`, {
      method: init.method ?? 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'x-cvr-client': 'web',
        ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new NetworkError();
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const envelope = ErrorEnvelopeSchema.safeParse(body);
    if (!envelope.success) throw new ApiError(response.status, 'INTERNAL_ERROR');
    throw new ApiError(response.status, envelope.data.error.code, envelope.data.error.params);
  }
  return schema.parse(body);
}

export const api = {
  me: () => apiRequest('/me', MeResponseSchema),
  createDeveloper: (body: CreateDeveloperRequest) =>
    apiRequest('/developers', MeResponseSchema, { method: 'POST', body }),
  updateProfile: (body: UpdateProfileRequest) =>
    apiRequest('/me/profile', MeResponseSchema, { method: 'PATCH', body }),
};
