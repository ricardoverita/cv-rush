import { Module } from '@nestjs/common';
import { IdentityService } from './application/identity.service.js';
import { IdentityRepository } from './infrastructure/identity.repository.js';
import { DeveloperAuthGuard, DeviceCookies } from './interfaces/developer-auth.js';

@Module({
  providers: [IdentityRepository, IdentityService, DeviceCookies, DeveloperAuthGuard],
  exports: [IdentityService, DeviceCookies, DeveloperAuthGuard],
})
export class IdentityModule {}
