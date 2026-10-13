import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { AppError } from './app-error.js';

/**
 * Validates a request part with a schema from `packages/contracts` (ADR-022).
 * Errors name the invalid fields but never echo submitted values.
 */
export class ZodValidationPipe<S extends z.ZodType> implements PipeTransform<unknown, z.infer<S>> {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.infer<S> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join('.') || '$'))];
    throw AppError.validation(fields);
  }
}
