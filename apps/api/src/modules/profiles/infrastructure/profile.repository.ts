import { Injectable } from '@nestjs/common';
import type { Db } from '../../../platform/database/db.js';
import type { Profile } from '../domain/profile.js';

const profileFields = {
  seniority: true,
  roleId: true,
  technologyIds: true,
  version: true,
  updatedAt: true,
  rankedLockedUntil: true,
} as const;

@Injectable()
export class ProfileRepository {
  create(db: Db, developerId: string, profile: Profile) {
    return db.developerProfile.create({
      data: { developerId, ...profile },
      select: profileFields,
    });
  }

  find(db: Db, developerId: string) {
    return db.developerProfile.findUnique({ where: { developerId }, select: profileFields });
  }

  update(db: Db, developerId: string, profile: Profile) {
    return db.developerProfile.update({
      where: { developerId },
      data: { ...profile, version: { increment: 1 } },
      select: profileFields,
    });
  }

  /** Locks role, seniority and stack for ranked until `until` (end of the UTC day). */
  async lockRanked(db: Db, developerId: string, until: Date): Promise<void> {
    await db.developerProfile.update({
      where: { developerId },
      data: { rankedLockedUntil: until },
    });
  }
}

export type StoredProfile = NonNullable<Awaited<ReturnType<ProfileRepository['find']>>>;
