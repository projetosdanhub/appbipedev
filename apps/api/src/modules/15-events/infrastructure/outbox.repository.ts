import { Database } from "../../00-shared/infrastructure/database.js";

export interface OutboxEventRow {
  id: string;
  tenantId: string;
  name: string;
  payload: any;
  status: string;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OutboxRepository {
  constructor(private readonly db: Database) {}

  async insertEvent(tenantId: string, name: string, payload: any, tx?: Database): Promise<void> {
    const client = tx || this.db;
    await client.query(
      `INSERT INTO outbox_events (id, tenant_id, name, payload) 
       VALUES (gen_random_uuid(), $1, $2, $3)`,
      [tenantId, name, JSON.stringify(payload)]
    );
  }

  async fetchPendingEvents(batchSize = 10, lockDurationMs = 60000): Promise<OutboxEventRow[]> {
    const lockTime = new Date(Date.now() + lockDurationMs);
    
    // Process only those that are PENDING or where lock expired
    const rows = await this.db.query(
      `UPDATE outbox_events
       SET status = 'PROCESSING', locked_until = $1, updated_at = NOW()
       WHERE id IN (
         SELECT id FROM outbox_events
         WHERE (status = 'PENDING' OR (status = 'PROCESSING' AND locked_until < NOW()))
         ORDER BY created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT $2
       )
       RETURNING 
         id, tenant_id as "tenantId", name, payload, status, 
         locked_until as "lockedUntil", created_at as "createdAt", updated_at as "updatedAt"`,
      [lockTime, batchSize]
    );

    return rows;
  }

  async markAsProcessed(eventId: string): Promise<void> {
    await this.db.query(
      `UPDATE outbox_events
       SET status = 'PROCESSED', locked_until = NULL, updated_at = NOW()
       WHERE id = $1`,
      [eventId]
    );
  }

  async markAsFailed(eventId: string): Promise<void> {
    await this.db.query(
      `UPDATE outbox_events
       SET status = 'FAILED', locked_until = NULL, updated_at = NOW()
       WHERE id = $1`,
      [eventId]
    );
  }
}
