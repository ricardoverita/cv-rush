import { Injectable } from '@nestjs/common';
import { AppError } from '../../../platform/http/app-error.js';
import type { Db } from '../../../platform/database/db.js';
import { generateDeviceToken, hashDeviceToken } from '../domain/device-token.js';
import { validateDisplayName } from '../domain/display-name.js';
import { IdentityRepository } from '../infrastructure/identity.repository.js';

/** How often a device's use is recorded (and its cookie renewed). */
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export interface DeveloperView {
  id: string;
  displayName: string;
  status: 'provisional' | 'claimed' | 'merged' | 'deleted';
  profileVisibility: 'private' | 'public';
  createdAt: Date;
}

export interface AuthenticatedDeveloper {
  developerId: string;
  /** True when this request renewed the credential: the cookie should be sent again. */
  renewed: boolean;
}

/** The identity module's public API. */
@Injectable()
export class IdentityService {
  constructor(private readonly repository: IdentityRepository) {}

  /** Normalizes and moderates a display name, or throws its semantic error. */
  checkDisplayName(raw: string): string {
    const result = validateDisplayName(raw);
    if (!result.ok) throw AppError.rule(result.code, result.params);
    return result.value;
  }

  /**
   * Creates a provisional Developer with a server-generated ID and a fresh device credential.
   * The raw token is returned once, for the cookie; only its hash is stored.
   */
  async createProvisionalDeveloper(
    db: Db,
    displayName: string,
  ): Promise<{ developer: DeveloperView; deviceToken: string }> {
    const deviceToken = generateDeviceToken();
    const developer = await this.repository.createDeveloper(
      db,
      displayName,
      hashDeviceToken(deviceToken),
    );
    return { developer, deviceToken };
  }

  /** Resolves the Developer behind a device token, or null. Never trusts a client-sent ID. */
  async authenticate(
    deviceToken: string | undefined,
    now = new Date(),
  ): Promise<AuthenticatedDeveloper | null> {
    if (!deviceToken) return null;
    const credential = await this.repository.findCredential(hashDeviceToken(deviceToken));
    if (!credential || credential.revokedAt) return null;
    const { status } = credential.developer;
    if (status !== 'provisional' && status !== 'claimed') return null;

    const renewed = now.getTime() - credential.lastUsedAt.getTime() >= TOUCH_INTERVAL_MS;
    if (renewed) await this.repository.touch(credential.id, credential.developerId, now);
    return { developerId: credential.developerId, renewed };
  }

  async getDeveloper(db: Db, developerId: string): Promise<DeveloperView> {
    const developer = await this.repository.findDeveloper(db, developerId);
    if (!developer) throw AppError.unauthenticated();
    return developer;
  }

  rename(db: Db, developerId: string, displayName: string): Promise<DeveloperView> {
    return this.repository.rename(db, developerId, displayName);
  }
}
