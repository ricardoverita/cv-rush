# Salary Negotiation

> Part 1 · Product & Game Design · Status: **Draft for review** · MVP (light) / **V1** (stage) · Feature flag: `salaryNegotiation`

## MVP: a graded recruiter question

In the MVP, salary appears as **slot R3 of [Recruiter Screening](recruiter-screening.md#the-salary-question-r3-graded)**: one question with **graded options** (`ALIGNED`, `UNDERSELL`, `VAGUE`, `OUT_OF_RANGE`) built from the job's salary range. It delivers the joke and the lesson ("know the band you applied to") without a new stage.

## V1: the full stage

### Fantasy

The offer call. "So, what are your salary expectations?" A short back-and-forth where reading the posting and negotiating calmly pays off, and greed or panic doesn't.

### Mechanic (proposal)

1. **Opening:** the recruiter asks for your expectation. Options are generated from the job range (as in R3).
2. **Counter:** depending on your answer, the recruiter makes a counter-offer ("We could do €52K").
3. **Decision:** accept, counter once more (up to the band's maximum), or push beyond the band.
4. Outcomes are graded:

| Path | Result |
|---|---|
| Aligned opening, then a reasonable counter within the band | Best outcome: points, speed boost |
| Accept a lowball immediately | Partial points ("You could have asked for more") |
| Push far beyond the band | CV damage and slowdown; never a game over |
| Vague answers throughout | Partial points; the recruiter "goes with the minimum" |

### Rules

- Uses the job's salary range, currency and seniority. It is coherent with what the player read.
- **Never a game over** by itself (as in the brief: it affects score, speed and CV Health).
- **Ranked:** the Daily Job has the same range for everyone and graded outcomes are deterministic, so it is fair.
- It adds about 15–20 s, so the pacing budget must absorb it (for example by shortening Segment 2).

### Open questions

- Should negotiation outcomes vary by region (cultural differences in negotiation norms)? Probably not: keep it about the posted band.
- Should there be a hidden "best possible deal" to discover? That adds depth, but in ranked it would be shared quickly.
