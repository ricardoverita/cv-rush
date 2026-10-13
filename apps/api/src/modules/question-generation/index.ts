export { contextKey, parseContextKey, type ContextKind } from './domain/context.js';
export type { QuestionGenerationProvider } from './domain/provider.js';
export {
  allocateContext,
  type BatchSummary,
  runGenerationBatch,
} from './application/generation-pipeline.js';
export { createQuestionProvider } from './infrastructure/providers/create-provider.js';
export { FakeQuestionGenerationProvider } from './infrastructure/providers/fake-question-provider.js';
