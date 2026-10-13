import { MeResponseSchema } from '@cv-rush/contracts';
import { describe, expect, it } from 'vitest';
import { ApiError, apiRequest, NetworkError } from './api';

function respond(status: number, body: unknown): typeof fetch {
  return async () => new Response(JSON.stringify(body), { status });
}

describe('apiRequest', () => {
  it('sends the client header and the JSON body to the same origin', async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const fetchImpl: typeof fetch = async (url, init) => {
      seen = { url: String(url), init: init ?? {} };
      return new Response('{}', { status: 400 });
    };
    await apiRequest(
      '/developers',
      MeResponseSchema,
      { method: 'POST', body: { a: 1 } },
      fetchImpl,
    ).catch(() => undefined);
    expect(seen?.url).toBe('/api/v1/developers');
    expect(seen?.init).toMatchObject({
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'x-cvr-client': 'web', 'content-type': 'application/json' },
      body: '{"a":1}',
    });
  });

  it('turns error envelopes into ApiError with code and params', async () => {
    const error = await apiRequest(
      '/developers',
      MeResponseSchema,
      {},
      respond(422, { error: { code: 'PROFILE_STACK_SIZE', params: { min: 1, max: 12 } } }),
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'PROFILE_STACK_SIZE',
      params: { min: 1, max: 12 },
    });
  });

  it('reports unreachable servers as NetworkError', async () => {
    const failing: typeof fetch = async () => {
      throw new TypeError('fetch failed');
    };
    await expect(apiRequest('/me', MeResponseSchema, {}, failing)).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});
