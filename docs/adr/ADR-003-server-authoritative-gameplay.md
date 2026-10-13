# ADR-003: Server-authoritative gameplay

- **Status:** Proposed
- **Date:** 2026-10-12

## Context

The game has public rankings, titles and (later) jobs. Players can open DevTools, read all JavaScript (the whole repository is public), modify variables, replay and forge requests, and script clients. Anything the browser decides can be faked.

## Decision

The server is the referee:

- The client sends **intents** (apply, reached checkpoint, selected option, ATS input log, bounded segment events) and renders **outcomes**.
- The server decides correctness, effects, CV Health, race time, position, score, XP, level and ranks, from its own records and clock.
- Questions are selected **just in time** when a challenge opens; answer keys never reach the client (ranked).
- A **state machine** rejects impossible transitions; deadlines, single answers and minimum segment times are enforced server-side.
- Client-reported events that can't be verified (collisions, pickups) have a **bounded** effect; the ATS is **re-simulated** from the input log.

## Alternatives considered

| Alternative | Why not |
|---|---|
| Client computes the score; the server validates totals | A modified client sends any total; validating totals without the inputs is impossible |
| Download the run's questions at start, encrypted or obfuscated | The key must be on the client; obfuscation is not security |
| Fully server-simulated physics (real-time netcode) | Huge complexity and latency sensitivity for a casual runner; bounded client events + re-simulation where cheap cover the risk |

## Consequences

- Positive: rankings resist tampering even with the source code public; results are explainable and auditable.
- Negative: more API calls per run (~15); latency must be hidden by animation (slow motion at junctions); the race model is shared code that must stay in sync between client rendering and server computation.
- Follow-ups: the tampering test suite; the V1 re-simulation of collisions from input logs.

## Related

[GameSession](../architecture/07-game-session.md), [anti-cheat](../anti-cheat/README.md), [protocol](../architecture/13-api-and-protocol.md).
