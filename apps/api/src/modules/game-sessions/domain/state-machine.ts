import type { ChallengeStage, SessionStage, SessionStatus } from '@cv-rush/contracts';

// The session state machine (docs/architecture/07 §1). Every change of status or stage goes
// through `transition`, which rejects anything not in the table: a request can't skip a stage.
//
//   created/job_review ──APPLY──▶ segment_1 ──START(recruiter)──▶ recruiter ──COMPLETE──▶ segment_2
//   ──START(ats)──▶ ats ──PASS_ATS──▶ segment_3 ──START(hiring_manager)──▶ hiring_manager
//   ──COMPLETE──▶ segment_4 ──START(final)──▶ final ──DELIVER──▶ delivered
//   (CV_DESTROYED / FAIL_ATS → failed · ABANDON → abandoned · EXPIRE_REVIEW / REPLACE → expired)

export interface SessionState {
  status: SessionStatus;
  stage: SessionStage;
}

export type SessionEvent =
  | { type: 'APPLY' }
  | { type: 'START'; challenge: ChallengeStage }
  | { type: 'COMPLETE'; challenge: 'recruiter' | 'hiring_manager' }
  | { type: 'PASS_ATS' }
  | { type: 'FAIL_ATS' }
  | { type: 'DELIVER' }
  | { type: 'DESTROY_CV' }
  | { type: 'ABANDON' }
  | { type: 'EXPIRE_REVIEW' };

export class InvalidTransition extends Error {
  constructor(
    readonly from: SessionState,
    readonly event: SessionEvent,
  ) {
    super(`Invalid transition: ${event.type} from ${from.status}/${from.stage}`);
    this.name = 'InvalidTransition';
  }
}

/** The racing segment that leads to each challenge. */
export const SEGMENT_BEFORE: Record<ChallengeStage, SessionStage> = {
  recruiter: 'segment_1',
  ats: 'segment_2',
  hiring_manager: 'segment_3',
  final: 'segment_4',
};

const SEGMENT_AFTER: Record<'recruiter' | 'hiring_manager', SessionStage> = {
  recruiter: 'segment_2',
  hiring_manager: 'segment_4',
};

const CHALLENGE_STAGES: readonly SessionStage[] = ['recruiter', 'ats', 'hiring_manager', 'final'];

export function isActive(state: SessionState): boolean {
  return state.status === 'created' || state.status === 'in_progress';
}

export function transition(state: SessionState, event: SessionEvent): SessionState {
  const { status, stage } = state;
  const fail = (): never => {
    throw new InvalidTransition(state, event);
  };

  if (status === 'created') {
    if (stage !== 'job_review') fail();
    if (event.type === 'APPLY') return { status: 'in_progress', stage: 'segment_1' };
    if (event.type === 'EXPIRE_REVIEW') return { status: 'expired_unstarted', stage };
    return fail();
  }
  if (status !== 'in_progress') return fail();

  switch (event.type) {
    case 'START':
      return stage === SEGMENT_BEFORE[event.challenge]
        ? { status, stage: event.challenge }
        : fail();
    case 'COMPLETE':
      return stage === event.challenge ? { status, stage: SEGMENT_AFTER[event.challenge] } : fail();
    case 'PASS_ATS':
      return stage === 'ats' ? { status, stage: 'segment_3' } : fail();
    case 'FAIL_ATS':
      return stage === 'ats' ? { status: 'failed', stage } : fail();
    case 'DELIVER':
      return stage === 'final' ? { status: 'delivered', stage: 'finished' } : fail();
    case 'DESTROY_CV':
      return CHALLENGE_STAGES.includes(stage) ? { status: 'failed', stage } : fail();
    case 'ABANDON':
      return { status: 'abandoned', stage };
    default:
      return fail();
  }
}
