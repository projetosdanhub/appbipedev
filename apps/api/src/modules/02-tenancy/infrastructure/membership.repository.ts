import { Database } from "../../00-shared/infrastructure/database.js";
import { Membership } from "../domain/membership.entity.js";
import { PoolClient } from "pg";

export class MembershipRepository {
  constructor(private readonly db: Database) {}

  /**
   * Must be called within a transaction that has the correct tenant context set via RLS.
   */
  async createWithinContext(client: PoolClient, userId: string, role: string = 'member'): Promise<Membership> {
    // Note: We don't need to pass tenant_id because the RLS policy requires us to supply it 
    // or we can infer it, but the schema requires tenant_id to be inserted.
    // Wait, the policy says: using (tenant_id = get_current_tenant())
    // So we must supply the tenant_id that matches the current_tenant context.
    
    // We can fetch the current tenant context from the DB session itself.
    const contextRes = await client.query("SELECT current_setting('app.current_tenant_id', true) as tid");
    const tenantId = contextRes.rows[0].tid;

    if (!tenantId) {
      throw new Error("Missing RLS tenant context in transaction");
    }

    const res = await client.query(
      `INSERT INTO memberships (tenant_id, user_id, role) 
       VALUES ($1, $2, $3) 
       RETURNING id, tenant_id as "tenantId", user_id as "userId", role, created_at as "createdAt", updated_at as "updatedAt"`,
      [tenantId, userId, role]
    );
    return res.rows[0];
  }

  /**
   * Finds all memberships for the CURRENT tenant context.
   * If RLS is working, it will naturally filter out other tenants even if we don't put a WHERE clause.
   */
  async findAllWithinContext(client: PoolClient): Promise<Membership[]> {
    const res = await client.query(
      `SELECT id, tenant_id as "tenantId", user_id as "userId", role, created_at as "createdAt", updated_at as "updatedAt" 
       FROM memberships`
    );
    return res.rows;
  }
}
