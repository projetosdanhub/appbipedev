import { Database } from "../../00-shared/infrastructure/database.js";
import { AuditLog, AuditLogListParams } from "@bipesend/contracts";

export class AuditRepository {
  constructor(private readonly db: Database) {}

  async list(tenantId: string, params: AuditLogListParams): Promise<{ data: AuditLog[]; nextCursor: string | null }> {
    const conditions: string[] = ["tenant_id = $1"];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (params.actorId) {
      conditions.push(`actor_id = $${paramIndex}`);
      values.push(params.actorId);
      paramIndex++;
    }

    if (params.action) {
      conditions.push(`action = $${paramIndex}`);
      values.push(params.action);
      paramIndex++;
    }

    if (params.cursor) {
      conditions.push(`created_at < $${paramIndex}`);
      values.push(params.cursor);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    
    const limit = params.limit + 1;
    values.push(limit);

    const res = await this.db.query(
      `SELECT 
         id, 
         tenant_id as "tenantId", 
         actor_id as "actorId", 
         target_id as "targetId", 
         action, 
         details, 
         created_at as "createdAt"
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${paramIndex}`,
      values
    );

    const hasMore = res.length > params.limit;
    const dataRows = hasMore ? res.slice(0, params.limit) : res;

    const data = dataRows.map(row => ({
      id: row.id,
      tenantId: row.tenantId,
      actorId: row.actorId,
      targetId: row.targetId,
      action: row.action,
      details: row.details,
      createdAt: row.createdAt.toISOString(),
    }));

    const nextCursor = hasMore ? data[data.length - 1].createdAt : null;

    return { data, nextCursor };
  }
}
