# ADR-019: Ranked attempts committed at race start (apply)

- **Status:** Accepted (Part 2 approved 2026-10-12)
- **Date:** 2026-10-12

## Context

Each developer has 3 ranked attempts per UTC day. Ranked is an explicit choice ("Play Ranked"). A player must not be able to enter, see questions, close, re-enter and repeat until a favorable run appears. At the same time, someone who opens ranked by mistake shouldn't lose an attempt before anything competitive happens.

## Decision

- A ranked attempt is **committed atomically at `apply`**, the moment the race starts: the session row is locked, an attempt number ≤ 3 is allocated (`PK (developer_id, day_key, number)` + `CHECK`), the profile is locked until the end of the UTC day, and the session moves to `in_progress`.
- **Before apply**, the client has only seen the **job posting** (open-book, unique to the session). No question, ATS stream or bot outcome is revealed, so backing out costs nothing and gains nothing.
- **After apply**, every exit (closing the tab, disconnecting, abandoning) keeps the attempt consumed; the session becomes `ABANDONED` after its maximum lifetime.
- Guards: one open session per developer; at most 10 uncommitted ranked session creations per day; expired uncommitted sessions never reuse their posting.
- Content availability for every slot is checked **before** apply (`RANKED_CONTENT_UNAVAILABLE` never costs an attempt).

## Alternatives considered

| Alternative | Why not |
|---|---|
| Commit at session creation | Punishes accidental opens and reading the job, with no integrity gain |
| Commit at the first question | Lets players restart until they like the race layout or the posting; a gap with no benefit |
| Commit at completion | Abandoning would be free: the classic re-roll exploit |

## Notes from approval

Approved as written: once a ranked run is applied, closing the tab, abandoning, losing the connection or leaving never returns the attempt. Distinguishing legitimate technical failures from abandonment may be revisited with real data; for the MVP the server's record is authoritative.

## Consequences

- Positive: no re-roll exploit; friendly to accidental opens; a clear rule for players ("the attempt starts when you apply").
- Negative: a player who loses connection right after apply loses the attempt, which is accepted and communicated.

## Related

[GameSession §3](../architecture/07-game-session.md#3-ranked-attempt-commitment), [anti-cheat](../anti-cheat/README.md), decision log D-051.
