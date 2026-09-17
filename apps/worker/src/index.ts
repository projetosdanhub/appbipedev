import { Pool } from "pg";
import { Redis } from "ioredis";
import { Queue } from "bullmq";
import { logger } from "@bipesend/logger";
import { config } from "dotenv";
import { Database } from "../../api/src/modules/00-shared/infrastructure/database.js";
import { startMessagesWorker } from "../../api/src/modules/06-inbox/infrastructure/messages-queue.js";

config({ path: "../../.env" });

export async function startWorker() {
  const db = new Database(process.env.DATABASE_URL!);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

  const eventsQueue = new Queue("domain-events", {
    connection: redisConnection,
  });

  async function relayOutbox() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const { rows } = await client.query(`
        UPDATE outbox_events
        SET status = 'PROCESSING', locked_until = NOW() + INTERVAL '30 seconds', updated_at = NOW()
        WHERE id IN (
          SELECT id FROM outbox_events
          WHERE status = 'PENDING' OR (status = 'PROCESSING' AND locked_until < NOW())
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 100
        )
        RETURNING *;
      `);
      
      await client.query("COMMIT");

      if (rows.length === 0) return;

      logger.info(`[Outbox Relay] Picked up ${rows.length} events`);

      for (const row of rows) {
        try {
          const payload = row.payload;
          
          await eventsQueue.add(row.name, payload, {
            jobId: row.id,
            removeOnComplete: true,
            removeOnFail: false,
          });

          await redisConnection.publish("events:broadcast", JSON.stringify(payload));
          await pool.query(`UPDATE outbox_events SET status = 'DONE', updated_at = NOW() WHERE id = $1`, [row.id]);
          
        } catch (err: any) {
          logger.error(`[Outbox Relay] Failed to process event ${row.id}`, err);
        }
      }
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("[Outbox Relay] Transaction failed", error);
    } finally {
      client.release();
    }
  }

  logger.info("[Worker] Starting outbox relay...");
  const interval = setInterval(relayOutbox, 2000);
  relayOutbox().catch(err => logger.error("Initial relay failed", err));

  logger.info("[Worker] Starting BullMQ workers...");
  const messagesWorker = startMessagesWorker(db, undefined);

  return {
    async close() {
      logger.info("Shutting down worker...");
      clearInterval(interval);
      await messagesWorker.close();
      await pool.end();
      await db.close();
      await redisConnection.quit();
    }
  };
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startWorker().then(worker => {
    process.on("SIGINT", async () => {
      await worker.close();
      process.exit(0);
    });
  }).catch(err => {
    logger.error("Failed to start worker", err);
    process.exit(1);
  });
}
