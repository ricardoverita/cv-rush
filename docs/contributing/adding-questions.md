# Adding questions

Questions are YAML files in `packages/content/data/questions/`. You don't need to touch any game code.

> **Important:** this repository is public, so questions in it are **never used in ranked play** (their answers are visible to everyone). They are for practice, learning, development and tests. Ranked questions live in a private pool (see [content strategy](../questions/content-strategy.md)). Today the repository only contains a **sample** pack; the format for community packs is the same.

## Format

```yaml
pack:
  id: sample
  source: sample        # sample | community
  description: What this pack contains.
questions:
  - id: redis.data-structures.list-as-queue   # unique, lowercase, dotted
    version: 1                                # bump when you change the meaning
    category: stack                           # stack | technical | situational | architecture | humor
    technologies: [redis]                     # ids from the catalog (can be empty)
    topics: [redis.data-structures]           # at least one
    difficulty: 2                             # 1 fundamentals … 5 distributed / organizational scale
    seniority: { min: junior, max: senior }   # trainee junior mid senior lead staff principal
    options: [a, b, c, d]                     # exactly 4
    correctOptionId: b                        # language-independent
    translations:                             # every supported locale: en, es
      en:
        prompt: Which Redis data structure is commonly used as a basic queue?   # ≤ 140 chars
        options: { a: Set, b: List, c: HyperLogLog, d: Bitmap }                   # ≤ 40 chars each
        explanation: A List supports LPUSH/RPOP, which gives FIFO queue behavior.
      es:
        prompt: ¿Qué estructura de datos de Redis se usa habitualmente como cola básica?
        options: { a: Set, b: List, c: HyperLogLog, d: Bitmap }
        explanation: Una List admite LPUSH/RPOP, lo que da un comportamiento de cola FIFO.
```

## Validate

```bash
pnpm questions:validate
```

It detects: schema errors, missing translations, duplicate options, a correct answer that isn't an option, invalid difficulty or seniority (and inverted ranges), unknown technologies, duplicate ids across packs, option texts that don't match the option ids, and texts that are too long.

## Writing good questions

- One unambiguous correct answer. If experts could argue, rewrite it.
- Plausible distractors; no joke options outside the `humor` category; no "all/none of the above".
- Concepts over version trivia.
- Honest difficulty (see the [difficulty scale](../questions/question-strategy.md#4-difficulty-scale-and-seniority-bands)).
- The same meaning and the same correct option in every language; keep technology names in English.
- **Original content only**: never copy from paid question banks, books or certification exams.
