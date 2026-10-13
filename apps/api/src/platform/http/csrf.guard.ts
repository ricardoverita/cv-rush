import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ENV, type Env } from '../config/env.js';
import { AppError } from './app-error.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const CLIENT_HEADER = 'x-cvr-client';

type Headers = Record<string, string | string[] | undefined>;

/**
 * CSRF defence in depth for cookie-authenticated requests (docs/architecture/06 §2), on top of
 * `SameSite=Lax`: state-changing requests need the custom client header (a cross-site page can't
 * send it without a CORS preflight, which this API never allows), a JSON content type, and, when
 * the browser says where the request comes from, the site's own origin.
 */
export function passesCsrfCheck(headers: Headers, allowedOrigin: string): boolean {
  if (headers[CLIENT_HEADER] !== 'web') return false;
  const contentType = headers['content-type'];
  if (typeof contentType === 'string' && !/^application\/json\b/i.test(contentType)) return false;
  const origin = headers.origin;
  if (origin !== undefined) return origin === allowedOrigin;
  const site = headers['sec-fetch-site'];
  if (site !== undefined) return site === 'same-origin';
  // Not a browser request: it can't carry somebody else's cookie, so there is nothing to forge.
  return true;
}

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly allowedOrigin: string;

  constructor(@Inject(ENV) env: Env) {
    this.allowedOrigin = new URL(env.PUBLIC_BASE_URL).origin;
  }

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (SAFE_METHODS.has(request.method)) return true;
    if (!passesCsrfCheck(request.headers, this.allowedOrigin)) {
      throw new AppError('CSRF_CHECK_FAILED', 403);
    }
    return true;
  }
}
