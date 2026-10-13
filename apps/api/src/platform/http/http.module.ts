import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard.js';
import { ErrorEnvelopeFilter } from './exception.filter.js';

/** Cross-cutting HTTP behaviour: the error envelope and the CSRF check on every route. */
@Module({
  providers: [
    { provide: APP_FILTER, useClass: ErrorEnvelopeFilter },
    { provide: APP_GUARD, useClass: CsrfGuard },
  ],
})
export class HttpModule {}
