import crypto from "node:crypto";
import { Database } from "../../00-shared/infrastructure/database.js";
import { Contact, CreateContactInput, UpdateContactInput } from "../domain/contact.entity.js";

const SELECT_FIELDS = `id, tenant_id as "tenantId", name, email, email_normalized as "emailNormalized", phone, phone_e164 as "phoneE164", phone_country as "phoneCountry", source, custom_fields as "customFields", department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", status, archived_at as "archivedAt", version, created_at as "createdAt", updated_at as "updatedAt"`;

export class ContactRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, input: CreateContactInput): Promise<Contact> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `INSERT INTO contacts (tenant_id, name, email, email_normalized, phone, phone_e164, phone_country, source, custom_fields, created_by_membership_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING ${SELECT_FIELDS}`,
        [
          tenantId, 
          input.name, 
          input.email || null, 
          input.emailNormalized || null,
          input.phone || null, 
          input.phoneE164 || null,
          input.phoneCountry || null,
          input.source || "manual",
          input.customFields ? JSON.stringify(input.customFields) : '{}',
          input.createdByMembershipId || null,
          input.status || "active"
        ]
      );
      return res[0];
    }, tenantId);
  }

  async list(tenantId: string, limit = 50, offset = 0): Promise<Contact[]> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT ${SELECT_FIELDS}
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
        `SELECT ${SELECT_FIELDS}
         FROM contacts
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, id]
      );
      return res[0] || null;
    }, tenantId);
  }

  async update(tenantId: string, id: string, expectedVersion: number, input: UpdateContactInput): Promise<Contact | null> {
    return this.db.withTransaction(async (txDb) => {
      const currentRows = await txDb.query(
        `SELECT version FROM contacts WHERE tenant_id = $1 AND id = $2 FOR UPDATE`,
        [tenantId, id]
      );
      if (currentRows.length === 0) throw new Error("NOT_FOUND");
      if (currentRows[0].version !== expectedVersion) throw new Error("CONCURRENCY_CONFLICT");

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
      if (input.emailNormalized !== undefined) {
        setClauses.push(`email_normalized = $${idx++}`);
        values.push(input.emailNormalized);
      }
      if (input.phone !== undefined) {
        setClauses.push(`phone = $${idx++}`);
        values.push(input.phone);
      }
      if (input.phoneE164 !== undefined) {
        setClauses.push(`phone_e164 = $${idx++}`);
        values.push(input.phoneE164);
      }
      if (input.phoneCountry !== undefined) {
        setClauses.push(`phone_country = $${idx++}`);
        values.push(input.phoneCountry);
      }
      if (input.source !== undefined) {
        setClauses.push(`source = $${idx++}`);
        values.push(input.source);
      }
      if (input.customFields !== undefined) {
        setClauses.push(`custom_fields = $${idx++}`);
        values.push(input.customFields ? JSON.stringify(input.customFields) : '{}');
      }
      if (input.status !== undefined) {
        setClauses.push(`status = $${idx++}`);
        values.push(input.status);
      }
      if (input.archivedAt !== undefined) {
        setClauses.push(`archived_at = $${idx++}`);
        values.push(input.archivedAt);
      }
      if (input.updatedByMembershipId !== undefined) {
        setClauses.push(`updated_by_membership_id = $${idx++}`);
        values.push(input.updatedByMembershipId);
      }

      if (setClauses.length === 0) {
        return this.findById(tenantId, id);
      }

      setClauses.push(`updated_at = NOW()`);
      setClauses.push(`version = version + 1`);
      
      const query = `UPDATE contacts SET ${setClauses.join(", ")} WHERE tenant_id = $${idx++} AND id = $${idx++} RETURNING ${SELECT_FIELDS}`;
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

  async assign(
    tenantId: string, 
    id: string, 
    expectedVersion: number, 
    departmentId: string | null, 
    routingRoleId: string | null, 
    assignedMembershipId: string | null,
    actorMembershipId: string
  ): Promise<Contact | null> {
    return this.db.withTransaction(async (txDb) => {
      // Fetch current state
      const currentRows = await txDb.query(
        `SELECT department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId" 
         FROM contacts 
         WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [id, tenantId]
      );
      
      if (currentRows.length === 0) return null;
      const current = currentRows[0];

      const res = await txDb.query(
        `UPDATE contacts 
         SET department_id = $1, routing_role_id = $2, assigned_membership_id = $3, version = version + 1, updated_at = NOW() 
         WHERE tenant_id = $4 AND id = $5 AND version = $6 
         RETURNING ${SELECT_FIELDS}`,
        [departmentId, routingRoleId, assignedMembershipId, tenantId, id, expectedVersion]
      );
      
      if (res.length === 0) return null;
      const contact = res[0];

      // Insert assignment history
      await txDb.query(
        `INSERT INTO assignment_histories (
          tenant_id, entity_type, entity_id, 
          from_department_id, from_routing_role_id, from_membership_id,
          to_department_id, to_routing_role_id, to_membership_id,
          actor_membership_id, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          tenantId, 'contact', id,
          current.departmentId, current.routingRoleId, current.assignedMembershipId,
          departmentId, routingRoleId, assignedMembershipId,
          actorMembershipId, contact.version
        ]
      );

      // Post outbox event
      await txDb.query(
        `INSERT INTO outbox_events (id, tenant_id, name, payload) VALUES ($1, $2, $3, $4)`,
        [
          crypto.randomUUID(),
          tenantId, 
          'crm.contact.assigned', 
          JSON.stringify({
            contactId: id,
            toDepartmentId: departmentId,
            toRoutingRoleId: routingRoleId,
            toMembershipId: assignedMembershipId,
            actorMembershipId,
            version: contact.version
          })
        ]
      );

      return contact;
    }, tenantId);
  }
}
