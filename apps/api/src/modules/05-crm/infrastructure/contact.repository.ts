import crypto from "node:crypto";
import { Database } from "../../00-shared/infrastructure/database.js";
import { Contact, CreateContactInput, UpdateContactInput } from "../domain/contact.entity.js";

export class ContactRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, input: CreateContactInput): Promise<Contact> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `INSERT INTO contacts (tenant_id, name, email, phone, custom_fields)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", version, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.name, input.email, input.phone, input.customFields ? JSON.stringify(input.customFields) : null]
      );
      return res[0];
    }, tenantId);
  }

  async list(tenantId: string, limit = 50, offset = 0): Promise<Contact[]> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", version, created_at as "createdAt", updated_at as "updatedAt"
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
        `SELECT id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", version, created_at as "createdAt", updated_at as "updatedAt"
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
      setClauses.push(`version = version + 1`);
      
      const query = `UPDATE contacts SET ${setClauses.join(", ")} WHERE tenant_id = $${idx++} AND id = $${idx++} RETURNING id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", version, created_at as "createdAt", updated_at as "updatedAt"`;
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
         RETURNING id, tenant_id as "tenantId", name, email, phone, custom_fields as "customFields", department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", version, created_at as "createdAt", updated_at as "updatedAt"`,
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
