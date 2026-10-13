import { Injectable } from '@nestjs/common';
import type { Db } from '../../../platform/database/db.js';
import type { Profile } from '../domain/profile.js';

const profileFields = {
  seniority: true,
  roleId: true,
  technologyIds: true,
  version: true,
  updatedAt: true,
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
}

export type StoredProfile = NonNullable<Awaited<ReturnType<ProfileRepository['find']>>>;
