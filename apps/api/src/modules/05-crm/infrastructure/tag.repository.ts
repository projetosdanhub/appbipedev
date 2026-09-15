import { Database } from "../../00-shared/infrastructure/database.js";
import { type CrmTag, type CreateCrmTag, type UpdateCrmTag } from "@bipesend/contracts";

export class TagRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, data: CreateCrmTag & { createdByMembershipId?: string | null }): Promise<CrmTag> {
    const result = await this.db.query<CrmTag>(
      `
      INSERT INTO tags (
        tenant_id, name, name_normalized, color_token, status, created_by_membership_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      RETURNING *
      `,
      [
        tenantId,
        data.name,
        data.name.toLowerCase().trim(),
        data.colorToken || null,
        data.status || 'active',
        data.createdByMembershipId || null,
      ]
    );
    return result[0];
  }

  async findById(tenantId: string, tagId: string): Promise<CrmTag | null> {
    const result = await this.db.query<CrmTag>(
      `SELECT * FROM tags WHERE id = $1 AND tenant_id = $2`,
      [tagId, tenantId]
    );
    return result[0] || null;
  }

  async findMany(
    tenantId: string,
    params: { limit?: number; offset?: number }
  ): Promise<{ data: CrmTag[]; total: number }> {
    const { limit = 50, offset = 0 } = params;
    
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM tags WHERE tenant_id = $1`,
      [tenantId]
    );

    const result = await this.db.query<CrmTag>(
      `
      SELECT * FROM tags
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

  async update(tenantId: string, tagId: string, data: UpdateCrmTag): Promise<CrmTag> {
    const updates: string[] = [];
    const values: any[] = [tagId, tenantId];
    let paramIndex = 3;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
      updates.push(`name_normalized = $${paramIndex++}`);
      values.push(data.name.toLowerCase().trim());
    }
    if (data.colorToken !== undefined) {
      updates.push(`color_token = $${paramIndex++}`);
      values.push(data.colorToken);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      const existing = await this.findById(tenantId, tagId);
      if (!existing) throw new Error("Tag not found");
      return existing;
    }

    updates.push(`updated_at = NOW()`);
    updates.push(`version = version + 1`);

    const result = await this.db.query<CrmTag>(
      `
      UPDATE tags
      SET ${updates.join(", ")}
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
      `,
      values
    );

    if (result.length === 0) throw new Error("Tag not found");
    return result[0];
  }

  async delete(tenantId: string, tagId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM tags WHERE id = $1 AND tenant_id = $2`,
      [tagId, tenantId]
    );
  }

  // --- Contact Tag associations ---

  async assignToContact(tenantId: string, contactId: string, tagId: string, membershipId: string | null = null): Promise<void> {
    await this.db.query(
      `
      INSERT INTO contact_tags (tenant_id, contact_id, tag_id, created_by_membership_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (contact_id, tag_id) DO NOTHING
      `,
      [tenantId, contactId, tagId, membershipId]
    );
  }

  async removeFromContact(tenantId: string, contactId: string, tagId: string): Promise<void> {
    await this.db.query(
      `
      DELETE FROM contact_tags
      WHERE tenant_id = $1 AND contact_id = $2 AND tag_id = $3
      `,
      [tenantId, contactId, tagId]
    );
  }
}
