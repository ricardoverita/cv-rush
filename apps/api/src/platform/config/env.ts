import { z } from 'zod';

/**
 * Environment configuration, validated at boot. Secrets never live in the repository:
 * `.env.example` documents every variable. Local development works without a .env file
 * thanks to the defaults below (they match compose.yaml); production requires explicit values.
 */
const LOCAL_DEFAULTS = {
  PUBLIC_BASE_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://cvrush:cvrush@localhost:5432/cvrush',
  REDIS_URL: 'redis://localhost:6379',
} as const;

export const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_HOST: z.string().min(1).default('0.0.0.0'),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    // The single public origin of the web app and the API (ADR-012). State-changing requests
    // must come from it, and device cookies are `Secure` when it uses HTTPS.
    PUBLIC_BASE_URL: z.url({ protocol: /^https?$/ }),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    REDIS_URL: z.url({ protocol: /^rediss?$/ }),
    QUESTION_GENERATION_PROVIDER: z.enum(['fake']).default('fake'),
    QUESTION_VERIFICATION_PROVIDER: z.enum(['fake']).default('fake'),
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.PUBLIC_BASE_URL.startsWith('https://'), {
    path: ['PUBLIC_BASE_URL'],
    message: 'must use https in production',
  });

export type Env = z.infer<typeof EnvSchema>;

export const ENV = Symbol('ENV');

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const defined = Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined && v !== ''),
  );
  const input = defined.NODE_ENV === 'production' ? defined : { ...LOCAL_DEFAULTS, ...defined };
  const parsed = EnvSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
