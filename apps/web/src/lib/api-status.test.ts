import { describe, expect, it } from 'vitest';
import { fetchApiStatus } from './api-status';

const healthy = {
  status: 'ok',
  service: 'api',
  version: '0.0.0',
  time: new Date().toISOString(),
};

function fakeFetch(response: Response | Error): typeof fetch {
  return (async () => {
    if (response instanceof Error) throw response;
    return response;
  }) as typeof fetch;
}

describe('fetchApiStatus', () => {
  it('is online when the API answers a valid health payload', async () => {
    const status = await fetchApiStatus('http://api', fakeFetch(Response.json(healthy)));
    expect(status).toBe('online');
  });

  it('is offline on network errors, bad status codes or invalid payloads', async () => {
    expect(await fetchApiStatus('http://api', fakeFetch(new Error('ECONNREFUSED')))).toBe(
      'offline',
    );
    expect(await fetchApiStatus('http://api', fakeFetch(new Response('', { status: 500 })))).toBe(
      'offline',
    );
    expect(await fetchApiStatus('http://api', fakeFetch(Response.json({ ok: true })))).toBe(
      'offline',
    );
  });
});
