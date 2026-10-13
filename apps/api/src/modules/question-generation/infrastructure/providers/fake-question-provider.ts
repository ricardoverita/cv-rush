import type { Locale } from '@cv-rush/contracts';
import type { GeneratedItem } from '../../domain/generated-item.js';
import { normalizeText } from '../../domain/item-rules.js';
import type {
  GenerationOutput,
  GenerationSpec,
  ItemWithoutKey,
  QuestionGenerationProvider,
  VerificationOutput,
} from '../../domain/provider.js';
import { FAKE_FIXTURES } from './fake-fixtures.js';

/**
 * Deterministic, offline provider for contributors, tests, CI and local development
 * (docs/architecture/10 §4). It returns fixture items for a context and verifies items by
 * looking up the fixture, so the whole pipeline runs without an API key.
 */
export class FakeQuestionGenerationProvider implements QuestionGenerationProvider {
  readonly id = 'fake';
  private readonly answers = new Map<string, GeneratedItem['correctOption']>();

  constructor(private readonly fixtures: Record<string, GeneratedItem[]> = FAKE_FIXTURES) {
    for (const items of Object.values(fixtures)) {
      for (const item of items) {
        for (const locale of ['en', 'es'] as const) {
          this.answers.set(normalizeText(item.translations[locale].question), item.correctOption);
        }
      }
    }
  }

  /** Contexts this provider has fixtures for (used by the seeding command). */
  contexts(): string[] {
    return Object.keys(this.fixtures).sort();
  }

  async generate(spec: GenerationSpec): Promise<GenerationOutput> {
    const items = (this.fixtures[spec.context.key] ?? []).slice(0, spec.count);
    return { items: structuredClone(items), model: 'fake-fixtures', costMicros: 0 };
  }

  async verify(item: ItemWithoutKey, _locale: Locale): Promise<VerificationOutput> {
    const answer = this.answers.get(normalizeText(item.question));
    return answer ? { answer, confidence: 1 } : { answer: 'A', confidence: 0 };
  }
}
