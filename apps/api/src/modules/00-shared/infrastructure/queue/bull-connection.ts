import { Redis } from 'ioredis';
import { env } from '../../../../config/env';

/**
 * Creates a new Redis connection optimized for BullMQ.
 * BullMQ requires `maxRetriesPerRequest: null`.
 */
export const createRedisConnection = () => {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
};

/**
 * Shared configuration for all BullMQ Queues and Workers
 */
export const bullConfig = {
  connection: createRedisConnection(),
  prefix: '{bipesend}',
};
