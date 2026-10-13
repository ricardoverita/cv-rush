import { z } from 'zod';

/**
 * Semantic error codes. The API never sends user-facing sentences:
 * clients translate codes through the `errors` message namespace.
 */
export const ERROR_CODES = [
  // Generic
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
  // Requests and identity
  'CSRF_CHECK_FAILED',
  'UNAUTHENTICATED',
  'DEVELOPER_ALREADY_EXISTS',
  // Display name
  'DISPLAY_NAME_TOO_SHORT',
  'DISPLAY_NAME_TOO_LONG',
  'DISPLAY_NAME_INVALID_CHARACTERS',
  'DISPLAY_NAME_CONTACT_INFO',
  'DISPLAY_NAME_NOT_ALLOWED',
  // Profile
  'PROFILE_ROLE_UNKNOWN',
  'PROFILE_SENIORITY_NOT_ALLOWED',
  'PROFILE_STACK_SIZE',
  'PROFILE_TECHNOLOGY_UNKNOWN',
  'PROFILE_TECHNOLOGY_INCOMPATIBLE',
  'PROFILE_CORE_CATEGORY_MISSING',
] as const;

export const ErrorCodeSchema = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    params: z.record(z.string(), z.unknown()).optional(),
    requestId: z.string().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
