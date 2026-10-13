import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/index.js';
import { IdentityModule } from '../identity/index.js';
import { JobChallengesModule } from '../job-challenges/index.js';
import { ProfilesModule } from '../profiles/index.js';
import { QuestionsModule } from '../questions/index.js';
import { GameSessionsService } from './application/game-sessions.service.js';
import { SessionRepository } from './infrastructure/session.repository.js';
import { GameSessionsController } from './interfaces/game-sessions.controller.js';

@Module({
  imports: [IdentityModule, ProfilesModule, CatalogModule, JobChallengesModule, QuestionsModule],
  controllers: [GameSessionsController],
  providers: [SessionRepository, GameSessionsService],
  exports: [GameSessionsService],
})
export class GameSessionsModule {}
