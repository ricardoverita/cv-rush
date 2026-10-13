import { Injectable } from '@nestjs/common';
import type { Db } from '../../../platform/database/db.js';
import { PrismaService } from '../../../platform/database/prisma.service.js';

const developerFields = {
  id: true,
  displayName: true,
  status: true,
  profileVisibility: true,
  createdAt: true,
} as const;

@Injectable()
export class IdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** A provisional Developer and its first device credential, written together. */
  createDeveloper(db: Db, displayName: string, tokenHash: Uint8Array<ArrayBuffer>) {
    return db.developer.create({
      data: { displayName, deviceCredentials: { create: { tokenHash } } },
      select: developerFields,
    });
  }

  findCredential(tokenHash: Uint8Array<ArrayBuffer>) {
    return this.prisma.deviceCredential.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        developerId: true,
        lastUsedAt: true,
        revokedAt: true,
        developer: { select: { status: true } },
      },
    });
  }

  /** Records that the device was used (at most hourly, see IdentityService). */
  async touch(credentialId: string, developerId: string, now: Date): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.deviceCredential.update({
        where: { id: credentialId },
        data: { lastUsedAt: now },
      }),
      this.prisma.developer.update({ where: { id: developerId }, data: { lastActiveAt: now } }),
    ]);
  }

  findDeveloper(db: Db, developerId: string) {
    return db.developer.findUnique({ where: { id: developerId }, select: developerFields });
  }

  rename(db: Db, developerId: string, displayName: string) {
    return db.developer.update({
      where: { id: developerId },
      data: { displayName },
      select: developerFields,
    });
  }
}
