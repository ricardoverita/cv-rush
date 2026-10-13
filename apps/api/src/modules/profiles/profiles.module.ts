import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/index.js';
import { IdentityModule } from '../identity/index.js';
import {
  CompetitiveSnapshots,
  GetMe,
  OnboardDeveloper,
  ProfilePolicy,
  UpdateProfile,
} from './application/profile-use-cases.js';
import { ProfileRepository } from './infrastructure/profile.repository.js';
import { DevelopersController } from './interfaces/developers.controller.js';
import { MeController } from './interfaces/me.controller.js';

@Module({
  imports: [IdentityModule, CatalogModule],
  controllers: [DevelopersController, MeController],
  providers: [
    ProfileRepository,
    ProfilePolicy,
    OnboardDeveloper,
    UpdateProfile,
    GetMe,
    CompetitiveSnapshots,
  ],
  exports: [CompetitiveSnapshots],
})
export class ProfilesModule {}
