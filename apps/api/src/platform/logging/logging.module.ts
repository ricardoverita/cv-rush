import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ENV, type Env } from '../config/env.js';

/**
 * Structured JSON logs (pino) with request IDs and redaction.
 * Never log cookies, credentials or contact data (see ADR-021).
 */
export const REDACTED_PATHS = [
  'req.headers.cookie',
  'req.headers.authorization',
  'res.headers["set-cookie"]',
  '*.email',
  '*.contactEmail',
  '*.token',
];

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ENV],
      useFactory: (env: Env) => ({
        pinoHttp: {
          level: env.LOG_LEVEL,
          genReqId: (req) => (req as { id?: string }).id ?? randomUUID(),
          redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
          customProps: () => ({ service: 'api' }),
          // Liveness probes are frequent; don't log them.
          autoLogging: {
            ignore: (req) => {
              const url = (req as { originalUrl?: string }).originalUrl ?? req.url ?? '';
              return url.split('?')[0]?.endsWith('/health') ?? false;
            },
          },
          ...(env.NODE_ENV === 'development'
            ? { transport: { target: 'pino-pretty', options: { singleLine: true } } }
            : {}),
        },
      }),
    }),
  ],
})
export class LoggingModule {}
