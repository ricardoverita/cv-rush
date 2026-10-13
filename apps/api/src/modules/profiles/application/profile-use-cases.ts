import { Injectable } from '@nestjs/common';
import type {
  CompetingContext,
  CreateDeveloperRequest,
  MeResponse,
  ProfileInput,
  UpdateProfileRequest,
} from '@cv-rush/contracts';
import type { Db } from '../../../platform/database/db.js';
import { PrismaService } from '../../../platform/database/prisma.service.js';
import { AppError } from '../../../platform/http/app-error.js';
import { CatalogService } from '../../catalog/index.js';
import { type DeveloperView, IdentityService } from '../../identity/index.js';
import { categoryOf, type Profile, validateProfile } from '../domain/profile.js';
import { ProfileRepository, type StoredProfile } from '../infrastructure/profile.repository.js';

/** Validation and response mapping shared by the profile use cases. */
@Injectable()
export class ProfilePolicy {
  constructor(private readonly catalog: CatalogService) {}

  check(input: ProfileInput): Profile {
    const result = validateProfile(this.catalog.rules(), input);
    if (!result.ok) throw AppError.rule(result.issue.code, result.issue.params);
    return result.profile;
  }

  toMe(developer: DeveloperView, profile: StoredProfile): MeResponse {
    return {
      developer: {
        id: developer.id,
        displayName: developer.displayName,
        status: developer.status,
        profileVisibility: developer.profileVisibility,
        createdAt: developer.createdAt.toISOString(),
      },
      profile: {
        seniority: profile.seniority,
        roleId: profile.roleId,
        technologyIds: profile.technologyIds,
        category: categoryOf(this.catalog.rules(), profile),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  }
}

/**
 * Light onboarding: creates the provisional Developer, its device credential and its profile in
 * one transaction. Everything is validated before anything is written.
 */
@Injectable()
export class OnboardDeveloper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
    private readonly profiles: ProfileRepository,
    private readonly policy: ProfilePolicy,
  ) {}

  async execute(request: CreateDeveloperRequest): Promise<{ me: MeResponse; deviceToken: string }> {
    const displayName = this.identity.checkDisplayName(request.displayName);
    const profile = this.policy.check(request);
    return this.prisma.$transaction(async (tx) => {
      const { developer, deviceToken } = await this.identity.createProvisionalDeveloper(
        tx,
        displayName,
      );
      const stored = await this.profiles.create(tx, developer.id, profile);
      return { me: this.policy.toMe(developer, stored), deviceToken };
    });
  }
}

/** Edits the name and/or the professional profile. The result is validated as a whole. */
@Injectable()
export class UpdateProfile {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
    private readonly profiles: ProfileRepository,
    private readonly policy: ProfilePolicy,
  ) {}

  async execute(developerId: string, request: UpdateProfileRequest): Promise<MeResponse> {
    const current = await this.profiles.find(this.prisma, developerId);
    if (!current) throw AppError.unauthenticated();
    const touchesCompetitiveProfile =
      request.seniority !== undefined ||
      request.roleId !== undefined ||
      request.technologyIds !== undefined;
    // The first ranked run of a UTC day locks the ranked profile until the day ends
    // (docs/product/competitive-identity.md §6): no category hopping within a day.
    if (
      touchesCompetitiveProfile &&
      current.rankedLockedUntil &&
      current.rankedLockedUntil > new Date()
    ) {
      throw new AppError('RANKED_PROFILE_LOCKED', 409, {
        until: current.rankedLockedUntil.toISOString(),
      });
    }
    const displayName =
      request.displayName === undefined
        ? undefined
        : this.identity.checkDisplayName(request.displayName);
    const profile = touchesCompetitiveProfile
      ? this.policy.check({
          seniority: request.seniority ?? current.seniority,
          roleId: request.roleId ?? current.roleId,
          technologyIds: request.technologyIds ?? current.technologyIds,
        })
      : undefined;

    return this.prisma.$transaction(async (tx) => {
      const developer = displayName
        ? await this.identity.rename(tx, developerId, displayName)
        : await this.identity.getDeveloper(tx, developerId);
      const stored = profile ? await this.profiles.update(tx, developerId, profile) : current;
      return this.policy.toMe(developer, stored);
    });
  }
}

@Injectable()
export class GetMe {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityService,
    private readonly profiles: ProfileRepository,
    private readonly policy: ProfilePolicy,
  ) {}

  async execute(developerId: string): Promise<MeResponse> {
    const [developer, profile] = await Promise.all([
      this.identity.getDeveloper(this.prisma, developerId),
      this.profiles.find(this.prisma, developerId),
    ]);
    if (!profile) throw AppError.unauthenticated();
    return this.policy.toMe(developer, profile);
  }
}

/**
 * The competitive identity snapshot (docs/product/competitive-identity.md §5): frozen when a
 * session is created and never read from the live profile again.
 */
@Injectable()
export class CompetitiveSnapshots {
  constructor(
    private readonly identity: IdentityService,
    private readonly profiles: ProfileRepository,
    private readonly catalog: CatalogService,
  ) {}

  async take(db: Db, developerId: string): Promise<CompetingContext> {
    const [developer, profile] = await Promise.all([
      this.identity.getDeveloper(db, developerId),
      this.profiles.find(db, developerId),
    ]);
    if (!profile) throw AppError.unauthenticated();
    const category = categoryOf(this.catalog.rules(), profile);
    return {
      displayName: developer.displayName,
      seniority: profile.seniority,
      band: category.band,
      roleId: profile.roleId,
      trackId: category.trackId,
      categoryKey: category.key,
      technologyIds: profile.technologyIds,
      profileVersion: profile.version,
    };
  }

  lockRanked(db: Db, developerId: string, until: Date): Promise<void> {
    return this.profiles.lockRanked(db, developerId, until);
  }
}
