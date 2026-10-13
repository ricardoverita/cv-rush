import { z } from 'zod';
import { SeniorityBandSchema, SenioritySchema } from './catalog.js';
import { CatalogIdSchema } from './catalog-view.js';
import { STACK_LIMITS } from './profile.js';

export const DEVELOPER_STATUSES = ['provisional', 'claimed', 'merged', 'deleted'] as const;
export const DeveloperStatusSchema = z.enum(DEVELOPER_STATUSES);

export const PROFILE_VISIBILITIES = ['private', 'public'] as const;
export const ProfileVisibilitySchema = z.enum(PROFILE_VISIBILITIES);

// Request schemas check shape and bounds only. Name and profile rules (profile.ts) run after
// normalization, so their errors carry precise codes instead of a generic VALIDATION_FAILED.
const DisplayNameInput = z.string().max(200);
// Generous upper bound: duplicates are removed before the 1–12 rule applies.
const TechnologyIdsInput = z.array(CatalogIdSchema).max(STACK_LIMITS.max * 2);

/** `POST /api/v1/developers`: light onboarding. No email and no LinkedIn at this point. */
export const CreateDeveloperRequestSchema = z
  .object({
    displayName: DisplayNameInput,
    seniority: SenioritySchema,
    roleId: CatalogIdSchema,
    technologyIds: TechnologyIdsInput,
  })
  .strict();
export type CreateDeveloperRequest = z.infer<typeof CreateDeveloperRequestSchema>;

/** `PATCH /api/v1/me/profile`: any subset of the onboarding fields. */
export const UpdateProfileRequestSchema = CreateDeveloperRequestSchema.partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to update' });
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/** `GET /api/v1/me` (and the body of a successful creation or update). Private to the owner. */
export const MeResponseSchema = z.object({
  developer: z.object({
    id: z.uuid(),
    displayName: z.string(),
    status: DeveloperStatusSchema,
    profileVisibility: ProfileVisibilitySchema,
    createdAt: z.iso.datetime(),
  }),
  profile: z.object({
    seniority: SenioritySchema,
    roleId: CatalogIdSchema,
    technologyIds: z.array(CatalogIdSchema),
    category: z.object({
      key: z.string(),
      trackId: CatalogIdSchema,
      band: SeniorityBandSchema,
    }),
    updatedAt: z.iso.datetime(),
  }),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;
