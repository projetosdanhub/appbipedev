import { Pool, PoolClient } from "pg";

import { OutboxTransaction } from "@bipesend/events";

export class Database implements OutboxTransaction {
  private pool: Pool;

  private client?: PoolClient;

  constructor(connectionStringOrPool: string | Pool, client?: PoolClient) {
    if (typeof connectionStringOrPool === "string") {
      this.pool = new Pool({ connectionString: connectionStringOrPool });
    } else {
      this.pool = connectionStringOrPool;
    }
    this.client = client;
  }

  async query<T = any>(text: string, params: any[] = []): Promise<T[]> {
    const executor = this.client || this.pool;
    const result = await executor.query(text, params);
    return result.rows;
  }

  async insertOutbox(event: import("@bipesend/contracts").DomainEvent): Promise<void> {
    const executor = this.client || this.pool;
    await executor.query(
      `INSERT INTO outbox_events (id, tenant_id, name, payload) VALUES ($1, $2, $3, $4)`,
      [event.id, event.tenantId, event.name, JSON.stringify(event)]
    );
  }

  /**
   * Executes a callback within a transaction.
   * If tenantId is provided, it sets the RLS context for that transaction.
   */
  async withTransaction<T>(
    callback: (db: Database) => Promise<T>,
    tenantId?: string
  ): Promise<T> {
    if (this.client) {
      if (tenantId) {
        await this.client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
      }
      return await callback(this);
    }

    const client = await this.pool.connect();
    const txDb = new Database(this.pool, client);
    try {
      await client.query("BEGIN");
      
      if (tenantId) {
        await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
      }

      const result = await callback(txDb);
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool && !this.client) {
      await this.pool.end();
    }
  }
}
