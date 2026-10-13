import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { ENV, type Env } from '../platform/config/env.js';
import { QUEUES } from '../platform/queue/queues.js';

/**
 * Maintenance queue. Today it only runs a heartbeat that proves the worker is alive;
 * later slices add the expired-session sweeper and the daily close here.
 */
@Injectable()
export class MaintenanceWorker implements OnModuleInit, OnModuleDestroy {
  private queue?: Queue;
  private worker?: Worker;

  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly logger: PinoLogger,
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
        this.logger.info({ job: job.name, jobId: job.id }, 'maintenance job processed');
        return { ok: true, at: new Date().toISOString() };
      },
      { connection, concurrency: 1 },
    );
    this.worker.on('failed', (job, error) =>
      this.logger.error({ job: job?.name, err: error }, 'maintenance job failed'),
    );
    await this.queue.upsertJobScheduler('heartbeat', { every: 60_000 }, { name: 'heartbeat' });
    this.logger.info({ queue: QUEUES.maintenance }, 'worker started');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }
}
