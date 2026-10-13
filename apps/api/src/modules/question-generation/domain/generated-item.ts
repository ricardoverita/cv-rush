import { z } from 'zod';

// The structured output every generation provider must return (docs/architecture/10 §5).
// Model output is untrusted data: it is parsed here and validated again before it is stored.

const Letter = z.enum(['A', 'B', 'C', 'D']);
const LocaleItem = z
  .object({
    question: z.string().min(1).max(140),
    options: z
      .object({
        A: z.string().min(1).max(40),
        B: z.string().min(1).max(40),
        C: z.string().min(1).max(40),
        D: z.string().min(1).max(40),
      })
      .strict(),
    explanation: z.string().min(1).max(300),
  })
  .strict();

export const GeneratedItemSchema = z
  .object({
    topic: z.string().min(1).max(60),
    difficulty: z.number().int().min(1).max(5),
    seniority: z.enum(['trainee', 'junior', 'mid', 'senior', 'lead', 'staff', 'principal']),
    role: z.string(),
    technology: z.string().nullable(),
    correctOption: Letter,
    translations: z.object({ en: LocaleItem, es: LocaleItem }).strict(),
  })
  .strict();
export type GeneratedItem = z.infer<typeof GeneratedItemSchema>;
export type OptionLetter = z.infer<typeof Letter>;
