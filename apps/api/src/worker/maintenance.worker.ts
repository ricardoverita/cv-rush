import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { GameSessionsService } from '../modules/game-sessions/index.js';
import { ENV, type Env } from '../platform/config/env.js';
import { QUEUES } from '../platform/queue/queues.js';

/**
 * Maintenance queue: scheduled, idempotent housekeeping (ADR-015).
 * - `heartbeat`: proves the worker is alive.
 * - `sweep-sessions`: expires unstarted sessions past their review window and abandons started
 *   ones past their maximum lifetime, with their results (docs/architecture/07 §8). Requests
 *   resolve the same deadlines lazily; the sweeper covers sessions nobody comes back to.
 */
@Injectable()
export class MaintenanceWorker implements OnModuleInit, OnModuleDestroy {
  private queue?: Queue;
  private worker?: Worker;

  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly logger: PinoLogger,
    private readonly sessions: GameSessionsService,
  ) {
    logger.setContext(MaintenanceWorker.name);
  }

  async onModuleInit(): Promise<void> {
    // BullMQ needs maxRetriesPerRequest: null for its blocking connections.
    const connection = { url: this.env.REDIS_URL, maxRetriesPerRequest: null };
    this.queue = new Queue(QUEUES.maintenance, { connection });
    this.worker = new Worker(
      QUEUES.maintenance,
      async (job) => {
        if (job.name === 'sweep-sessions') {
          const handled = await this.sessions.sweep();
          if (handled > 0) this.logger.info({ handled }, 'overdue sessions closed');
          return { handled };
        }
        this.logger.info({ job: job.name, jobId: job.id }, 'maintenance job processed');
        return { ok: true, at: new Date().toISOString() };
      },
      { connection, concurrency: 1 },
    );
    this.worker.on('failed', (job, error) =>
      this.logger.error({ job: job?.name, err: error }, 'maintenance job failed'),
    );
    await this.queue.upsertJobScheduler('heartbeat', { every: 60_000 }, { name: 'heartbeat' });
    await this.queue.upsertJobScheduler(
      'sweep-sessions',
      { every: 60_000 },
      { name: 'sweep-sessions' },
    );
    this.logger.info({ queue: QUEUES.maintenance }, 'worker started');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }
}
