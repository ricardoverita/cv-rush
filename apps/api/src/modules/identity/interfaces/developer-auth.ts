import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ENV, type Env } from '../../../platform/config/env.js';
import { AppError } from '../../../platform/http/app-error.js';
import { IdentityService } from '../application/identity.service.js';
import {
  type DeviceCookieSettings,
  deviceCookieSettings,
  readDeviceCookie,
  serializeDeviceCookie,
} from './device-cookie.js';

type RequestWithDeveloper = FastifyRequest & { developerId?: string };

/** Reads and writes the device credential cookie. */
@Injectable()
export class DeviceCookies {
  readonly settings: DeviceCookieSettings;

  constructor(@Inject(ENV) env: Env) {
    this.settings = deviceCookieSettings(env.PUBLIC_BASE_URL);
  }

  read(request: FastifyRequest): string | undefined {
    return readDeviceCookie(request.headers.cookie, this.settings.name);
  }

  write(reply: FastifyReply, token: string): void {
    void reply.header('set-cookie', serializeDeviceCookie(this.settings, token));
  }
}

/**
 * Requires a valid device credential and exposes its Developer to the handler through
 * `@CurrentDeveloper()`. Renews the cookie's lifetime when the credential is touched.
 */
@Injectable()
export class DeveloperAuthGuard implements CanActivate {
  constructor(
    private readonly identity: IdentityService,
    private readonly cookies: DeviceCookies,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithDeveloper>();
    const token = this.cookies.read(request);
    const authenticated = await this.identity.authenticate(token);
    if (!authenticated || !token) throw AppError.unauthenticated();
    if (authenticated.renewed) this.cookies.write(http.getResponse<FastifyReply>(), token);
    request.developerId = authenticated.developerId;
    return true;
  }
}

/** The authenticated Developer's ID (set by DeveloperAuthGuard). */
export const CurrentDeveloper = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const { developerId } = context.switchToHttp().getRequest<RequestWithDeveloper>();
  if (!developerId) throw AppError.unauthenticated();
  return developerId;
});
