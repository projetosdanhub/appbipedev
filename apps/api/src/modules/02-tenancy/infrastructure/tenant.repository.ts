import { Database } from "../../00-shared/infrastructure/database.js";
import { Tenant } from "../domain/tenant.entity.js";
import { randomUUID } from "node:crypto";

export class TenantRepository {
  constructor(private readonly db: Database) {}

  async create(name: string, id: string = randomUUID()): Promise<Tenant> {
    return this.db.withTransaction(async (txDb) => {
      const rows = await txDb.query(
        `INSERT INTO tenants (id, name) VALUES ($1, $2) RETURNING id, name, created_at as "createdAt", updated_at as "updatedAt"`,
        [id, name]
      );
      return rows[0];
    }, id);
  }

  async findById(id: string): Promise<Tenant | null> {
    const rows = await this.db.query(
      `SELECT id, name, created_at as "createdAt", updated_at as "updatedAt" FROM tenants WHERE id = $1`,
      [id]
    );
    return rows.length ? rows[0] : null;
  }
}
