import { isWellFormedDeviceToken } from '../domain/device-token.js';

/** Browsers cap cookie lifetimes around 400 days; the API renews it while the device is used. */
export const DEVICE_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export interface DeviceCookieSettings {
  name: string;
  secure: boolean;
}

/**
 * Production (https): `__Host-dc; Secure` — the prefix forbids a Domain attribute and requires
 * Secure, so subdomains can't plant or read it. Local http development: a plain `dc` cookie.
 */
export function deviceCookieSettings(publicBaseUrl: string): DeviceCookieSettings {
  const secure = new URL(publicBaseUrl).protocol === 'https:';
  return { name: secure ? '__Host-dc' : 'dc', secure };
}

export function serializeDeviceCookie(settings: DeviceCookieSettings, token: string): string {
  const attributes = [
    `${settings.name}=${token}`,
    'Path=/',
    `Max-Age=${DEVICE_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (settings.secure) attributes.push('Secure');
  return attributes.join('; ');
}

/** Reads the device token from a Cookie header. Malformed values are ignored. */
export function readDeviceCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator === -1 || pair.slice(0, separator).trim() !== name) continue;
    const value = pair.slice(separator + 1).trim();
    return isWellFormedDeviceToken(value) ? value : undefined;
  }
  return undefined;
}
