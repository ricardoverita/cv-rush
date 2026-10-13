import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/index.js';
import { JobChallengeService } from './application/job-challenge.service.js';

@Module({
  imports: [CatalogModule],
  providers: [JobChallengeService],
  exports: [JobChallengeService],
})
export class JobChallengesModule {}
