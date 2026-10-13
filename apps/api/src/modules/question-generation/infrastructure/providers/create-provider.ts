import type { QuestionGenerationProvider } from '../../domain/provider.js';
import { FakeQuestionGenerationProvider } from './fake-question-provider.js';

/**
 * Selects the provider by configuration (QUESTION_GENERATION_PROVIDER /
 * QUESTION_VERIFICATION_PROVIDER). Only `fake` exists until slice S6 adds real adapters; adding
 * one is a new case here and a new file next to this one, nothing else changes.
 */
export function createQuestionProvider(id: string): QuestionGenerationProvider {
  switch (id) {
    case 'fake':
      return new FakeQuestionGenerationProvider();
    default:
      throw new Error(`Unknown question generation provider "${id}"`);
  }
}
