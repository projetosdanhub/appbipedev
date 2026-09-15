import { Database } from "../../00-shared/infrastructure/database.js";
import { type CrmSegment, type CreateCrmSegment, type UpdateCrmSegment } from "@bipesend/contracts";

export class SegmentRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, data: CreateCrmSegment): Promise<CrmSegment> {
    const result = await this.db.query<CrmSegment>(
      `
      INSERT INTO segments (
        tenant_id, name, description, filter_ast, visibility, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      RETURNING *
      `,
      [
        tenantId,
        data.name,
        data.description || null,
        JSON.stringify(data.filterAst),
        data.visibility || 'private',
        data.status || 'active'
      ]
    );
    return result[0];
  }

  async findById(tenantId: string, segmentId: string): Promise<CrmSegment | null> {
    const result = await this.db.query<CrmSegment>(
      `SELECT * FROM segments WHERE id = $1 AND tenant_id = $2`,
      [segmentId, tenantId]
    );
    return result[0] || null;
  }

  async findMany(tenantId: string, params: { limit?: number; offset?: number }): Promise<{ data: CrmSegment[]; total: number }> {
    const { limit = 50, offset = 0 } = params;
  
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM segments WHERE tenant_id = $1`,
      [tenantId]
    );

    const result = await this.db.query<CrmSegment>(
      `
      SELECT * FROM segments
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [tenantId, limit, offset]
    );

    return {
      data: result,
      total: parseInt(countResult[0].count, 10),
    };
  }

  async update(tenantId: string, segmentId: string, data: UpdateCrmSegment): Promise<CrmSegment> {
    const updates: string[] = [];
    const values: any[] = [segmentId, tenantId];
    let paramIndex = 3;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.filterAst !== undefined) {
      updates.push(`filter_ast = $${paramIndex++}`);
      values.push(JSON.stringify(data.filterAst));
    }
    if (data.visibility !== undefined) {
      updates.push(`visibility = $${paramIndex++}`);
      values.push(data.visibility);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      const existing = await this.findById(tenantId, segmentId);
      if (!existing) throw new Error("Segment not found");
      return existing;
    }

    updates.push(`updated_at = NOW()`);
    updates.push(`version = version + 1`);

    const result = await this.db.query<CrmSegment>(
      `
      UPDATE segments
      SET ${updates.join(", ")}
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
      `,
      values
    );

    if (result.length === 0) throw new Error("Segment not found");
    return result[0];
  }

  async delete(tenantId: string, segmentId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM segments WHERE id = $1 AND tenant_id = $2`,
      [segmentId, tenantId]
    );
  }
}
