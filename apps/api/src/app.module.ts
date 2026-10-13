import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/index.js';
import { ConfigModule } from './platform/config/config.module.js';
import { DatabaseModule } from './platform/database/database.module.js';
import { LoggingModule } from './platform/logging/logging.module.js';
import { RedisModule } from './platform/redis/redis.module.js';

/** HTTP application: platform modules + feature modules (added by the vertical slices). */
@Module({
  imports: [ConfigModule, LoggingModule, DatabaseModule, RedisModule, HealthModule],
})
export class AppModule {}
