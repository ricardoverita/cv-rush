import type { Locale } from '@cv-rush/contracts';
import type { QuestionContextRef } from './context.js';
import type { OptionLetter } from './generated-item.js';

// The provider-agnostic contract (docs/architecture/10 §4). The domain and the Question Engine
// never import an adapter: the configured provider is injected. Adapters for real providers
// (OpenAI, Anthropic, Gemini…) arrive in slice S6 and implement exactly this interface.

export interface GenerationSpec {
  context: QuestionContextRef;
  count: number;
  promptVersion: string;
  /** Normalized prompts already in the context, to avoid near-duplicates. */
  existingPrompts: string[];
}

export interface GenerationOutput {
  /** Raw, untrusted items: validated by the pipeline, never by the provider. */
  items: unknown[];
  model: string;
  costMicros: number;
}

/** A generated item as the verifier sees it: no correct option, no explanation. */
export interface ItemWithoutKey {
  question: string;
  options: Record<OptionLetter, string>;
}

export interface VerificationOutput {
  answer: OptionLetter;
  confidence: number;
}

export interface QuestionGenerationProvider {
  readonly id: string;
  generate(spec: GenerationSpec): Promise<GenerationOutput>;
  verify(item: ItemWithoutKey, locale: Locale): Promise<VerificationOutput>;
}
