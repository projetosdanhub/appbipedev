import { Queue } from 'bullmq';
import { bullConfig } from '../../00-shared/infrastructure/queue/bull-connection.js';
import { createWorker } from '../../00-shared/infrastructure/queue/base-worker.js';
import { Database } from '../../00-shared/infrastructure/database.js';
import type { WebsocketGateway } from '../../15-events/infrastructure/websocket.gateway.js';
import { EvolutionClient } from '@bipesend/evolution';
import { logger } from '../../00-shared/infrastructure/logger.js';

export interface OutboundMessageJob {
  tenantId: string;
  conversationId: string;
  messageId: string;
  contactNumber: string;
  data: {
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    mediaName?: string;
  };
}

export const outboundMessagesQueue = new Queue<OutboundMessageJob>('outbound-messages', bullConfig);

export const startMessagesWorker = (db: Database, gateway?: WebsocketGateway) => {
  return createWorker<OutboundMessageJob>('outbound-messages', async (job) => {
    const { tenantId, conversationId, messageId, contactNumber, data } = job.data;

    // 1. Transactional check for idempotency
    const res = await db.query(
      `UPDATE messages SET state = 'sending' WHERE id = $1 AND state = 'pending' RETURNING id`,
      [messageId]
    );

    if (res.length === 0) {
      logger.info(`Message ${messageId} skipped (already processed or not pending)`);
      return;
    }

    // 2. Client configuration (from env for now)
    const apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_GLOBAL_API_KEY || '';
    const instanceName = `tenant_${tenantId}`;
    const client = new EvolutionClient(apiUrl, apiKey, instanceName);

    try {
      if (data.mediaUrl) {
        const isAudio = data.mediaType?.includes('audio') || data.mediaUrl.endsWith('.ogg');
        const appUrl = process.env.API_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3333';
        const publicMediaUrl = data.mediaUrl.startsWith('http') ? data.mediaUrl : `${appUrl}${data.mediaUrl}`;

        if (isAudio) {
          await client.sendWhatsAppAudio({
            number: contactNumber,
            audio: publicMediaUrl,
            delayMessage: 1000,
          });
        } else {
          await client.sendMedia({
            number: contactNumber,
            mediatype: data.mediaType?.includes('video') ? 'video' : 'image',
            mimetype: data.mediaType || 'image/jpeg',
            media: publicMediaUrl,
            fileName: data.mediaName,
            caption: data.text,
            delayMessage: 1000,
          });
        }
      } else if (data.text) {
        await client.sendText({
          number: contactNumber,
          text: data.text,
          delayMessage: 1000,
        });
      }

      // 3. Mark as sent
      await db.query(`UPDATE messages SET state = 'sent' WHERE id = $1`, [messageId]);

    } catch (err: any) {
      // 4. Mark as failed if the actual HTTP API call throws an error
      logger.error(`Failed to send message ${messageId} via Evolution API`, err);
      await db.query(`UPDATE messages SET state = 'failed' WHERE id = $1`, [messageId]);
      gateway?.broadcastToTenant(tenantId, 'inbox.changed', { conversationId });
      throw err; // Throw so BullMQ knows it failed and can retry if configured
    }

    // 5. Notify success
    gateway?.broadcastToTenant(tenantId, 'inbox.changed', { conversationId });
  });
};
