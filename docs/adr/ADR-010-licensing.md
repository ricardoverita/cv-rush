# ADR-010: Licensing — Apache-2.0 for code, CC BY 4.0 for content, branding excluded

- **Status:** Accepted (direction approved 2026-10-12; legal files implemented in Part 3)
- **Date:** 2026-10-12

## Context

The repository is public. The goals: allow contributions, let the project be studied, ease adoption, **keep recognition of the original project**, and build a community. The project contains three different kinds of material:

1. **Code:** apps, packages, tools, configuration.
2. **Content:** catalogs, job fragments, question templates' prose, sample and future community question packs, bot and humor lines, documentation, game art that isn't brand identity.
3. **Branding:** the name "CV Rush", logos, wordmarks and brand-identity art.

Relicensing later requires every contributor's permission, so the choice must be made carefully now.

## Decision

| Material | License | Where |
|---|---|---|
| Code | **Apache License 2.0** | Root `LICENSE` + `NOTICE` |
| Content (`packages/content/data/**`, `docs/**`, non-brand game art) | **Creative Commons Attribution 4.0 International (CC BY 4.0)** | `LICENSE` files in those directories + a section in the root README |
| Branding (name, logos, wordmarks, brand mascot art) | **Not licensed**; a brand policy (`TRADEMARKS.md`) explains permitted references and asks forks to rebrand | `TRADEMARKS.md`, `assets/brand/` |
| UI message catalogs (`packages/i18n`) | Apache-2.0 (part of the application) | — |
| Third-party assets (fonts, sounds) | Their own licenses | `THIRD_PARTY_NOTICES.md` |

**Contributions:** no CLA. Apache-2.0 §5 ("inbound = outbound") covers code contributions; content contributions are under CC BY 4.0. The PR template includes an attestation ("I wrote this or have the right to submit it; content is original and not copied from paid banks, books or certification exams"). Contributors keep their copyright. A DCO sign-off can be introduced later if provenance becomes a concern.

**Attribution and copyright:** `NOTICE` reads "CV Rush — Copyright 2026 The CV Rush contributors" and must be preserved by redistributors (Apache-2.0 §4d). Contributors are listed in the repository; community questions carry an `author` field shown in practice reviews ("Question by @handle"), which satisfies CC BY's attribution.

**AI-generated content:** pools in the private database are operational data and are not distributed. Their copyright status varies by jurisdiction; if any are ever published, they'll be released under CC BY 4.0 to the extent copyright exists.

## Apache-2.0 vs MIT

| | Apache-2.0 | MIT |
|---|---|---|
| Permissive, commercial use, modification | ✅ | ✅ |
| Simplicity | Longer text | Very short |
| **Explicit patent grant** (and termination on patent litigation) | ✅ | ❌ |
| **Explicit contribution terms** (§5) | ✅ | ❌ (implicit) |
| **NOTICE file preserved in redistributions** (keeps recognition of the original project) | ✅ | Only the copyright line |
| **Trademarks explicitly not granted** (§6) | ✅ | ❌ (silent) |
| Changes must be marked in modified files | ✅ | ❌ |
| GPL compatibility | GPLv3 yes, GPLv2 no | Broad |

Apache-2.0 matches the goals better: recognition (NOTICE), clean contribution terms without a CLA, patent safety for contributors and adopters, and an explicit separation from branding. Its main cost (a longer license, GPLv2 incompatibility) is minor for this project.

## Why CC BY 4.0 for content

- Software licenses fit content poorly (e.g. "source code" concepts for a question or a translation).
- CC BY 4.0 allows reuse (including commercial) with attribution, which maximizes the educational value of questions and docs.
- **CC BY-SA** was considered: it would force derived question banks to stay open, but it complicates mixing with other material and reduces adoption. **CC0** gives up attribution, which conflicts with the recognition goal.

## How the licenses coexist

- Each file is under exactly one license, determined by its directory (documented in the root README and `LICENSE` files).
- Code that **loads** content doesn't change the content's license, and vice versa.
- A fork can reuse the code (Apache-2.0) and content (CC BY 4.0, with attribution) but must use its own name and logo.

## Alternatives considered

| Alternative | Why not |
|---|---|
| MIT for everything | No patent grant, no NOTICE mechanism, silent on trademarks, unfit for content |
| AGPL/GPL | Discourages adoption and contributions from companies; heavier obligations than the project needs |
| A CLA | Friction for contributors; unnecessary with Apache-2.0 §5 |
| One license for code and content | Software licenses don't fit content well |

## Consequences

- Positive: clear rules for contributors; recognition preserved; brand protected; content reusable for learning.
- Negative: two licenses to explain (one README section handles it); Apache-2.0's change-marking obligation for redistributors.
- Implemented in Part 3: `LICENSE` (Apache-2.0), `NOTICE`, `docs/LICENSE` and `packages/content/data/LICENSE` (CC BY 4.0), `TRADEMARKS.md`, `THIRD_PARTY_NOTICES.md`, the PR template attestation and the README section. The content package keeps code (`src/`, Apache-2.0) and content (`data/`, CC BY 4.0) in separate directories.

## Related

[Community strategy](../product/community.md), [content strategy](../questions/content-strategy.md).
