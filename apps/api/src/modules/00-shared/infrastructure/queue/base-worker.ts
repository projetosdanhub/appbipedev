import { Worker, WorkerOptions, Processor } from 'bullmq';
import { bullConfig } from './bull-connection';
import { logger } from '../logger';

// Store all active workers to easily shut them down on SIGTERM/SIGINT
const activeWorkers: Worker[] = [];

/**
 * Creates a BullMQ worker with standard logging and graceful shutdown tracking.
 */
export const createWorker = <T>(
  queueName: string,
  processor: Processor<T>,
  options?: Omit<WorkerOptions, 'connection' | 'prefix'>
): Worker<T> => {
  const worker = new Worker<T>(queueName, processor, {
    ...bullConfig,
    ...options,
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully in queue ${queueName}.`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in queue ${queueName}`, err);
  });

  worker.on('error', (err) => {
    logger.error(`Worker error in queue ${queueName}`, err);
  });

  activeWorkers.push(worker);

  return worker;
};

/**
 * Gracefully shuts down all tracked BullMQ workers.
 * Used during application shutdown (e.g. fastify.close())
 */
export const shutdownWorkers = async () => {
  logger.info(`Shutting down ${activeWorkers.length} BullMQ workers...`);
  await Promise.allSettled(activeWorkers.map((worker) => worker.close()));
  // We can also quit the shared connection when we are done, though we might want to do it centrally
  if (activeWorkers.length > 0) {
    // Only disconnect if we had workers to avoid closing early
    await bullConfig.connection.quit();
  }
  logger.info('BullMQ workers shutdown complete.');
};
