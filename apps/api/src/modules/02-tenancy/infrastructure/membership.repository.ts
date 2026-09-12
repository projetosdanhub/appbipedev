import { Database } from "../../00-shared/infrastructure/database.js";
import { Membership } from "../domain/membership.entity.js";

export class MembershipRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, userId: string, role: string = 'member'): Promise<Membership> {
    const res = await this.db.query<Membership>(
      `INSERT INTO memberships (tenant_id, user_id, role) 
       VALUES ($1, $2, $3) 
       RETURNING id, tenant_id as "tenantId", user_id as "userId", role, created_at as "createdAt", updated_at as "updatedAt"`,
      [tenantId, userId, role]
    );
    return res[0];
  }

  async findAllByTenant(tenantId: string): Promise<Membership[]> {
    const res = await this.db.query<Membership>(
      `SELECT id, tenant_id as "tenantId", user_id as "userId", role, created_at as "createdAt", updated_at as "updatedAt" 
       FROM memberships WHERE tenant_id = $1`,
      [tenantId]
    );
    return res;
  }
}
