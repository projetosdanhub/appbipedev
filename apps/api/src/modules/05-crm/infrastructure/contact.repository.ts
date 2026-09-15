import { Database } from "../../00-shared/infrastructure/database.js";
import { Contact, CreateContactInput, UpdateContactInput } from "../domain/contact.entity.js";

export class ContactRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, input: CreateContactInput): Promise<Contact> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `INSERT INTO contacts (tenant_id, name, email, phone, custom_fields)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.name, input.email, input.phone, input.customFields ? JSON.stringify(input.customFields) : null]
      );
      return res[0];
    }, tenantId);
  }

  async list(tenantId: string, limit = 50, offset = 0): Promise<Contact[]> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", created_at as "createdAt", updated_at as "updatedAt"
         FROM contacts
         WHERE tenant_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [tenantId, limit, offset]
      );
      return res;
    }, tenantId);
  }

  async findById(tenantId: string, id: string): Promise<Contact | null> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", created_at as "createdAt", updated_at as "updatedAt"
         FROM contacts
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, id]
      );
      return res[0] || null;
    }, tenantId);
  }

  async update(tenantId: string, id: string, input: UpdateContactInput): Promise<Contact | null> {
    return this.db.withTransaction(async (txDb) => {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (input.name !== undefined) {
        setClauses.push(`name = $${idx++}`);
        values.push(input.name);
      }
      if (input.email !== undefined) {
        setClauses.push(`email = $${idx++}`);
        values.push(input.email);
      }
      if (input.phone !== undefined) {
        setClauses.push(`phone = $${idx++}`);
        values.push(input.phone);
      }
      if (input.customFields !== undefined) {
        setClauses.push(`custom_fields = $${idx++}`);
        values.push(input.customFields ? JSON.stringify(input.customFields) : null);
      }

      if (setClauses.length === 0) {
        return this.findById(tenantId, id);
      }

      setClauses.push(`updated_at = NOW()`);
      
      const query = `UPDATE contacts SET ${setClauses.join(", ")} WHERE tenant_id = $${idx++} AND id = $${idx++} RETURNING id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", created_at as "createdAt", updated_at as "updatedAt"`;
      values.push(tenantId, id);

      const res = await txDb.query(query, values);
      return res[0] || null;
    }, tenantId);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `DELETE FROM contacts WHERE tenant_id = $1 AND id = $2 RETURNING id`,
        [tenantId, id]
      );
      return res.length > 0;
    }, tenantId);
  }
}
