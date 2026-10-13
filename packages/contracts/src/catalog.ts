import { z } from 'zod';

/** Declared seniority levels (displayed exactly as declared). */
export const SENIORITIES = [
  'trainee',
  'junior',
  'mid',
  'senior',
  'lead',
  'staff',
  'principal',
] as const;
export const SenioritySchema = z.enum(SENIORITIES);
export type Seniority = z.infer<typeof SenioritySchema>;

/** Seniority bands used to group comparable profiles in ranked play. */
export const SENIORITY_BANDS = ['junior', 'mid', 'senior_plus'] as const;
export const SeniorityBandSchema = z.enum(SENIORITY_BANDS);
export type SeniorityBand = z.infer<typeof SeniorityBandSchema>;

const BAND_BY_SENIORITY: Record<Seniority, SeniorityBand> = {
  trainee: 'junior',
  junior: 'junior',
  mid: 'mid',
  senior: 'senior_plus',
  lead: 'senior_plus',
  staff: 'senior_plus',
  principal: 'senior_plus',
};

export function bandForSeniority(seniority: Seniority): SeniorityBand {
  return BAND_BY_SENIORITY[seniority];
}

/** Compares two seniorities by their position in SENIORITIES. */
export function compareSeniority(a: Seniority, b: Seniority): number {
  return SENIORITIES.indexOf(a) - SENIORITIES.indexOf(b);
}

/** Question difficulty scale (1 fundamentals … 5 distributed and organizational scale). */
export const DifficultySchema = z.number().int().min(1).max(5);
export type Difficulty = z.infer<typeof DifficultySchema>;
