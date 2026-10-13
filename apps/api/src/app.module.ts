import { Module } from '@nestjs/common';
import { CatalogModule } from './modules/catalog/index.js';
import { GameSessionsModule } from './modules/game-sessions/index.js';
import { HealthModule } from './modules/health/index.js';
import { IdentityModule } from './modules/identity/index.js';
import { ProfilesModule } from './modules/profiles/index.js';
import { ConfigModule } from './platform/config/config.module.js';
import { DatabaseModule } from './platform/database/database.module.js';
import { HttpModule } from './platform/http/http.module.js';
import { LoggingModule } from './platform/logging/logging.module.js';
import { RedisModule } from './platform/redis/redis.module.js';

/** HTTP application: platform modules + feature modules (added by the vertical slices). */
@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    RedisModule,
    HttpModule,
    HealthModule,
    CatalogModule,
    IdentityModule,
    ProfilesModule,
    GameSessionsModule,
  ],
})
export class AppModule {}
