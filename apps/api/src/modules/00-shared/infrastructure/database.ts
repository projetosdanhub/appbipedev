import { Pool, PoolClient } from "pg";

export class Database {
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

  /**
   * Executes a callback within a transaction.
   * If tenantId is provided, it sets the RLS context for that transaction.
   */
  async withTransaction<T>(
    callback: (db: Database) => Promise<T>,
    tenantId?: string
  ): Promise<T> {
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
