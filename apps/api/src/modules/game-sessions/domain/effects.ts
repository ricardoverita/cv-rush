import type { ChallengeStage, Effect } from '@cv-rush/contracts';
import type { Ruleset } from '@cv-rush/content';

// What an answer does to the run (docs/game-design/challenges/*, cv-health.md). The server
// decides; the client only animates. Speed effects are recorded now and drive the race in S3.

export type QuestionStage = Exclude<ChallengeStage, 'ats'>;
export type ResolvedOutcome =
  | { kind: 'correct' }
  | { kind: 'incorrect' }
  | { kind: 'timeout' }
  | { kind: 'graded'; grade: 'aligned' | 'undersell' | 'vague' | 'out_of_range' };

const SPEED_BOOST = 5;
const SLOWDOWN = -5;
const FINAL_BOOST = 20;

export function questionEffects(
  stage: QuestionStage,
  outcome: ResolvedOutcome,
  ruleset: Ruleset,
): Effect[] {
  const damage = ruleset.cvHealth.damage;
  if (outcome.kind === 'graded') {
    if (outcome.grade === 'aligned') {
      return [
        { code: 'SPEED_BOOST', value: SPEED_BOOST },
        { code: 'ATS_BONUS', value: ruleset.ats.recruiterBonusPerCorrect },
      ];
    }
    if (outcome.grade === 'out_of_range') {
      return [
        { code: 'CV_DAMAGE', value: damage.salaryOutOfRange },
        { code: 'SLOWDOWN', value: SLOWDOWN },
      ];
    }
    return [];
  }
  if (outcome.kind === 'correct') {
    if (stage === 'recruiter') {
      return [
        { code: 'SPEED_BOOST', value: SPEED_BOOST },
        { code: 'ATS_BONUS', value: ruleset.ats.recruiterBonusPerCorrect },
      ];
    }
    if (stage === 'final') return [{ code: 'FINAL_BOOST', value: FINAL_BOOST }];
    return [{ code: 'SPEED_BOOST', value: SPEED_BOOST }];
  }
  const cv = { code: 'CV_DAMAGE' as const, value: damage[stage] };
  return stage === 'final' ? [cv] : [cv, { code: 'SLOWDOWN', value: SLOWDOWN }];
}

export function applyCvDamage(cvHealth: number, effects: Effect[]): number {
  const damage = effects.filter((e) => e.code === 'CV_DAMAGE').reduce((sum, e) => sum + e.value, 0);
  return Math.max(0, cvHealth - damage);
}
