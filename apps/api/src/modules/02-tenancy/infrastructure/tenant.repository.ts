import { Database } from "../../00-shared/infrastructure/database.js";
import { Tenant } from "../domain/tenant.entity.js";

export class TenantRepository {
  constructor(private readonly db: Database) {}

  async create(name: string): Promise<Tenant> {
    const rows = await this.db.query(
      `INSERT INTO tenants (name) VALUES ($1) RETURNING id, name, created_at as "createdAt", updated_at as "updatedAt"`,
      [name]
    );
    return rows[0];
  }

  async findById(id: string): Promise<Tenant | null> {
    const rows = await this.db.query(
      `SELECT id, name, created_at as "createdAt", updated_at as "updatedAt" FROM tenants WHERE id = $1`,
      [id]
    );
    return rows.length ? rows[0] : null;
  }
}
