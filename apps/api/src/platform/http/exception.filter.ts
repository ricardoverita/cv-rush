import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { ErrorCode, ErrorEnvelope } from '@cv-rush/contracts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error.js';

function codeForStatus(status: number): ErrorCode {
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 503) return 'SERVICE_UNAVAILABLE';
  if (status >= 500) return 'INTERNAL_ERROR';
  return 'VALIDATION_FAILED';
}

/** Every error leaves the API as `{ error: { code, params?, requestId } }` (docs/architecture/13). */
@Catch()
export class ErrorEnvelopeFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorEnvelopeFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();

    let status: number;
    let code: ErrorCode;
    let params: Record<string, unknown> | undefined;
    if (exception instanceof AppError) {
      ({ status, code, params } = exception);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = codeForStatus(status);
    } else if (isFastifyClientError(exception)) {
      // Body parsing (malformed JSON, unsupported content type, payload too large).
      status = exception.statusCode;
      code = codeForStatus(status);
    } else {
      status = 500;
      code = 'INTERNAL_ERROR';
      this.logger.error(exception);
    }

    const body: ErrorEnvelope = { error: { code, requestId: request.id } };
    if (params) body.error.params = params;
    void reply.status(status).header('cache-control', 'no-store').send(body);
  }
}

function isFastifyClientError(error: unknown): error is { statusCode: number } {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return false;
  const { statusCode } = error;
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;
}
