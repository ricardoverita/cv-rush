import { Module } from '@nestjs/common';
import { GameSessionsModule } from './modules/game-sessions/index.js';
import { ConfigModule } from './platform/config/config.module.js';
import { DatabaseModule } from './platform/database/database.module.js';
import { LoggingModule } from './platform/logging/logging.module.js';
import { MaintenanceWorker } from './worker/maintenance.worker.js';

/** Worker process: queue processors and schedulers. No HTTP server. */
@Module({
  imports: [ConfigModule, LoggingModule, DatabaseModule, GameSessionsModule],
  providers: [MaintenanceWorker],
})
export class WorkerModule {}
