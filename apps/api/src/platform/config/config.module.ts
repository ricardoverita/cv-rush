import { Global, Module } from '@nestjs/common';
import { Clock } from '../clock.js';
import { Rulesets } from '../rulesets.js';
import { ENV, loadEnv } from './env.js';

@Global()
@Module({
  providers: [{ provide: ENV, useFactory: () => loadEnv() }, Clock, Rulesets],
  exports: [ENV, Clock, Rulesets],
})
export class ConfigModule {}
