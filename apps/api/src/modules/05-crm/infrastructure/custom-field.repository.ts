import { Database } from "../../00-shared/infrastructure/database.js";
import { CustomField } from "@bipesend/contracts";

export class CustomFieldRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, input: Omit<CustomField, "id" | "createdAt" | "updatedAt">): Promise<CustomField> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `INSERT INTO custom_fields (tenant_id, entity_type, key, label, type, options)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, tenant_id as "tenantId", entity_type as "entityType", key, label, type, options, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.entityType, input.key, input.label, input.type, input.options ? JSON.stringify(input.options) : null]
      );
      return res[0];
    }, tenantId);
  }

  async list(tenantId: string, entityType: string): Promise<CustomField[]> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT id, tenant_id as "tenantId", entity_type as "entityType", key, label, type, options, created_at as "createdAt", updated_at as "updatedAt"
         FROM custom_fields
         WHERE tenant_id = $1 AND entity_type = $2
         ORDER BY created_at DESC`,
        [tenantId, entityType]
      );
      return res;
    }, tenantId);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `DELETE FROM custom_fields WHERE tenant_id = $1 AND id = $2 RETURNING id`,
        [tenantId, id]
      );
      return res.length > 0;
    }, tenantId);
  }

  async findById(tenantId: string, id: string): Promise<CustomField | null> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT id, tenant_id as "tenantId", entity_type as "entityType", key, label, type, options, created_at as "createdAt", updated_at as "updatedAt"
         FROM custom_fields
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, id]
      );
      return res[0] || null;
    }, tenantId);
  }

  async update(tenantId: string, id: string, input: any): Promise<CustomField> {
    return this.db.withTransaction(async (txDb) => {
      const updates: string[] = [];
      const values: any[] = [tenantId, id];
      let counter = 3;

      if (input.label !== undefined) {
        updates.push(`label = $${counter++}`);
        values.push(input.label);
      }
      if (input.options !== undefined) {
        updates.push(`options = $${counter++}`);
        values.push(input.options ? JSON.stringify(input.options) : null);
      }
      
      updates.push(`updated_at = NOW()`);

      const res = await txDb.query(
        `UPDATE custom_fields SET ${updates.join(', ')} WHERE tenant_id = $1 AND id = $2 RETURNING id, tenant_id as "tenantId", entity_type as "entityType", key, label, type, options, created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );
      return res[0];
    }, tenantId);
  }
}
