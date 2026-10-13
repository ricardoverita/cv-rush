import { describe, expect, it } from 'vitest';
import { generateDeviceToken } from '../domain/device-token.js';
import { deviceCookieSettings, readDeviceCookie, serializeDeviceCookie } from './device-cookie.js';

describe('device cookie', () => {
  it('uses a __Host- Secure cookie on https', () => {
    const settings = deviceCookieSettings('https://cvrush.example');
    expect(settings).toEqual({ name: '__Host-dc', secure: true });
    expect(serializeDeviceCookie(settings, 'TOKEN')).toBe(
      '__Host-dc=TOKEN; Path=/; Max-Age=34560000; HttpOnly; SameSite=Lax; Secure',
    );
  });

  it('uses a plain cookie for local http development', () => {
    const settings = deviceCookieSettings('http://localhost:3000');
    expect(settings).toEqual({ name: 'dc', secure: false });
    expect(serializeDeviceCookie(settings, 'TOKEN')).not.toContain('Secure');
  });

  it('reads the token among other cookies and ignores malformed values', () => {
    const token = generateDeviceToken();
    expect(readDeviceCookie(`NEXT_LOCALE=es; dc=${token}; theme=dark`, 'dc')).toBe(token);
    expect(readDeviceCookie(`xdc=${token}`, 'dc')).toBeUndefined();
    expect(readDeviceCookie('dc=not-a-token', 'dc')).toBeUndefined();
    expect(readDeviceCookie(undefined, 'dc')).toBeUndefined();
  });
});
