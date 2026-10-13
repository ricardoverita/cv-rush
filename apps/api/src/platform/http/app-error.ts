import type { ErrorCode } from '@cv-rush/contracts';

/**
 * An expected failure with a semantic code. The API never sends user-facing sentences:
 * clients translate the code (and its params) through the `errors` message namespace.
 */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: number,
    readonly params?: Record<string, unknown>,
  ) {
    super(code);
    this.name = 'AppError';
  }

  static validation(fields: string[]): AppError {
    return new AppError('VALIDATION_FAILED', 400, { fields });
  }

  static unauthenticated(): AppError {
    return new AppError('UNAUTHENTICATED', 401);
  }

  /** A business rule rejected otherwise well-formed input. */
  static rule(code: ErrorCode, params?: Record<string, unknown>): AppError {
    return new AppError(code, 422, params);
  }
}
