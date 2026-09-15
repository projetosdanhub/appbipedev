import { Database } from "../../00-shared/infrastructure/database.js";

interface CreateErrorReportDTO {
  tenantId?: string;
  actorId?: string;
  requestId: string;
  errorCode: string;
  context?: unknown;
}

export class ErrorReportRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateErrorReportDTO) {
    await this.db.query(
      `INSERT INTO error_reports (tenant_id, actor_id, request_id, error_code, context)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.tenantId || null,
        data.actorId || null,
        data.requestId,
        data.errorCode,
        data.context ? JSON.stringify(data.context) : null,
      ]
    );
  }

  async findMany(
    tenantId: string,
    params: { status?: string; errorCode?: string; limit: number; offset: number }
  ) {
    const conditions = ["tenant_id = $1"];
    const values: unknown[] = [tenantId];
    let i = 2;

    if (params.status) {
      conditions.push(`status = $${i++}`);
      values.push(params.status);
    }
    if (params.errorCode) {
      conditions.push(`error_code = $${i++}`);
      values.push(params.errorCode);
    }

    const res = await this.db.query(
      `SELECT id, tenant_id as "tenantId", actor_id as "actorId", request_id as "requestId", 
              error_code as "errorCode", context, status, created_at as "createdAt"
       FROM error_reports
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...values, params.limit, params.offset]
    );

    return res;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const res = await this.db.query(
      `UPDATE error_reports 
       SET status = $1 
       WHERE id = $2 AND tenant_id = $3
       RETURNING id`,
      [status, id, tenantId]
    );
    return res.length > 0;
  }
}
