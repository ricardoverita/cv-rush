import { describe, expect, it } from 'vitest';
import { passesCsrfCheck } from './csrf.guard.js';

const origin = 'https://cvrush.example';
const web = { 'x-cvr-client': 'web', 'content-type': 'application/json' };

describe('passesCsrfCheck', () => {
  it('accepts same-origin requests from the web app', () => {
    expect(passesCsrfCheck({ ...web, origin }, origin)).toBe(true);
    expect(passesCsrfCheck({ ...web, 'sec-fetch-site': 'same-origin' }, origin)).toBe(true);
    expect(
      passesCsrfCheck(
        { ...web, 'content-type': 'application/json; charset=utf-8', origin },
        origin,
      ),
    ).toBe(true);
  });

  it('rejects requests without the client header', () => {
    expect(passesCsrfCheck({ 'content-type': 'application/json', origin }, origin)).toBe(false);
    expect(passesCsrfCheck({ ...web, 'x-cvr-client': 'other', origin }, origin)).toBe(false);
  });

  it('rejects form-like content types', () => {
    for (const type of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']) {
      expect(passesCsrfCheck({ ...web, 'content-type': type, origin }, origin)).toBe(false);
    }
  });

  it('rejects other origins and cross-site fetches', () => {
    expect(passesCsrfCheck({ ...web, origin: 'https://evil.example' }, origin)).toBe(false);
    expect(passesCsrfCheck({ ...web, origin: 'http://cvrush.example' }, origin)).toBe(false);
    expect(passesCsrfCheck({ ...web, 'sec-fetch-site': 'cross-site' }, origin)).toBe(false);
    expect(passesCsrfCheck({ ...web, 'sec-fetch-site': 'same-site' }, origin)).toBe(false);
  });

  it('lets non-browser clients through (they carry no ambient cookies)', () => {
    expect(passesCsrfCheck(web, origin)).toBe(true);
  });
});
