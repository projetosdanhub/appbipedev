import { Pool } from "pg";
import { DomainEvent } from "@bipesend/contracts";
import { tenantEventKey } from "./index.js";

/**
 * Executes a callback only if the event hasn't been processed by this consumer before.
 * Uses a unique constraint on the `event_dedupe` table to ensure idempotency.
 */
export async function withDedupe(
  pool: Pool,
  consumer: string,
  event: DomainEvent,
  callback: () => Promise<void>
): Promise<void> {
  const dedupeId = tenantEventKey(event, consumer);

  try {
    // Try to insert a lock record for this specific event and consumer
    await pool.query(
      `INSERT INTO event_dedupe (id, tenant_id, consumer, event_id)
       VALUES ($1, $2, $3, $4)`,
      [dedupeId, event.tenantId, consumer, event.id]
    );
  } catch (error: any) {
    // If it's a unique constraint violation (code 23505 in Postgres), it means we already processed it
    if (error.code === "23505") {
      console.log(`[DEDUPE] Event ${event.id} already processed by ${consumer}. Skipping.`);
      return;
    }
    throw error;
  }

  try {
    await callback();
  } catch (error) {
    // If the callback fails, we remove the dedupe lock so it can be retried
    await pool.query(`DELETE FROM event_dedupe WHERE id = $1`, [dedupeId]);
    throw error;
  }
}
