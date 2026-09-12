import { Pool, PoolClient } from "pg";

export class Database {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async query<T = any>(text: string, params: any[] = []): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows;
  }

  /**
   * Executes a callback within a transaction.
   * If tenantId is provided, it sets the RLS context for that transaction.
   */
  async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    tenantId?: string
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      
      if (tenantId) {
        await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
      }

      const result = await callback(client);
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
    await this.pool.end();
  }
}
