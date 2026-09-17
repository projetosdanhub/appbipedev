import crypto from "node:crypto";
import { Database } from "../../00-shared/infrastructure/database.js";
import { Conversation, CreateConversation } from "@bipesend/contracts";
import { ConversationEntity } from "../domain/conversation.entity.js";

export class ConversationRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateConversation, tenantId: string, createdByMembershipId: string): Promise<Conversation> {
    const entity = ConversationEntity.create(data, tenantId, createdByMembershipId);
    
    await this.db.query(
      `INSERT INTO conversations (
        id, tenant_id, contact_id, subject, source, channel_reference, status,
        department_id, routing_role_id, assigned_membership_id, created_by_membership_id,
        version, last_activity_at, closed_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        entity.id, entity.tenantId, entity.contactId, entity.subject, entity.source,
        entity.channelReference, entity.status, entity.departmentId, entity.routingRoleId,
        entity.assignedMembershipId, entity.createdByMembershipId, entity.version,
        entity.lastActivityAt, entity.closedAt, entity.createdAt, entity.updatedAt
      ]
    );
    
    return entity;
  }
  
  async findById(id: string, tenantId: string): Promise<Conversation | null> {
    const rows = await this.db.query(
      `SELECT * FROM conversations WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    
    if (rows.length === 0) return null;
    return this.mapToDoc(rows[0]);
  }
  
  async findByContactId(contactId: string, tenantId: string): Promise<Conversation[]> {
    const rows = await this.db.query(
      `SELECT * FROM conversations WHERE contact_id = $1 AND tenant_id = $2 ORDER BY last_activity_at DESC`,
      [contactId, tenantId]
    );
    
    return rows.map(doc => this.mapToDoc(doc));
  }

  async findAll(tenantId: string): Promise<Conversation[]> {
    const rows = await this.db.query(
      `SELECT * FROM conversations WHERE tenant_id = $1 ORDER BY last_activity_at DESC`,
      [tenantId]
    );
    return rows.map(doc => this.mapToDoc(doc));
  }

  async updateStatus(
    txDb: Database,
    tenantId: string,
    conversationId: string,
    newStatus: string,
    actorMembershipId: string,
    reason?: string,
    expectedVersion?: number
  ): Promise<Conversation> {
    const currentRows = await txDb.query(
      `SELECT status, version, closed_at FROM conversations WHERE id = $1 AND tenant_id = $2`,
      [conversationId, tenantId]
    );
    if (currentRows.length === 0) throw new Error("Conversation not found");
    const current = currentRows[0];
    if (expectedVersion && current.version !== expectedVersion) throw new Error("Conflict: Version mismatch");

    const closedAt = newStatus === 'closed' ? new Date() : (current.status === 'closed' ? null : (current.closed_at ? new Date(current.closed_at) : null));
    const nextVersion = current.version + 1;

    const rows = await txDb.query(
      `UPDATE conversations
       SET status = $1, version = $2, closed_at = $3, updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5 AND version = $6
       RETURNING *`,
      [newStatus, nextVersion, closedAt, conversationId, tenantId, current.version]
    );

    if (rows.length === 0) throw new Error("Update failed due to concurrent modification");

    await txDb.query(
      `INSERT INTO conversation_status_history (
        id, tenant_id, conversation_id, from_status, to_status, actor_membership_id, reason, occurred_at, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
      [
        crypto.randomUUID(), tenantId, conversationId, current.status, newStatus, actorMembershipId, reason || null, nextVersion
      ]
    );

    return this.mapToDoc(rows[0]);
  }

  async update(
    tenantId: string,
    conversationId: string,
    expectedVersion: number,
    data: import("@bipesend/contracts").UpdateConversation,
    actorMembershipId: string
  ): Promise<Conversation> {
    const currentRows = await this.db.query(
      `SELECT version, department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId" 
       FROM conversations WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
      [conversationId, tenantId]
    );

    if (currentRows.length === 0) throw new Error("NOT_FOUND");
    if (currentRows[0].version !== expectedVersion) throw new Error("CONCURRENCY_CONFLICT");
    
    const current = currentRows[0];

    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    let assignmentChanged = false;

    if (data.departmentId !== undefined) {
      sets.push(`department_id = $${idx++}`);
      values.push(data.departmentId);
      if (data.departmentId !== current.departmentId) assignmentChanged = true;
    }
    if (data.routingRoleId !== undefined) {
      sets.push(`routing_role_id = $${idx++}`);
      values.push(data.routingRoleId);
      if (data.routingRoleId !== current.routingRoleId) assignmentChanged = true;
    }
    if (data.assignedMembershipId !== undefined) {
      sets.push(`assigned_membership_id = $${idx++}`);
      values.push(data.assignedMembershipId);
      if (data.assignedMembershipId !== current.assignedMembershipId) assignmentChanged = true;
    }

    if (sets.length === 0) {
      const currentConv = await this.findById(conversationId, tenantId);
      if (!currentConv) throw new Error("NOT_FOUND");
      return currentConv;
    }

    sets.push(`updated_at = NOW()`);
    sets.push(`version = version + 1`);

    values.push(conversationId, tenantId);

    const rows = await this.db.query(
      `UPDATE conversations
       SET ${sets.join(", ")}
       WHERE id = $${idx++} AND tenant_id = $${idx++}
       RETURNING *`,
      values
    );

    const conv = this.mapToDoc(rows[0]);

    if (assignmentChanged) {
      await this.db.query(
        `INSERT INTO assignment_histories (
          tenant_id, entity_type, entity_id, 
          from_department_id, from_routing_role_id, from_membership_id,
          to_department_id, to_routing_role_id, to_membership_id,
          actor_membership_id, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          tenantId, 'conversation', conversationId,
          current.departmentId, current.routingRoleId, current.assignedMembershipId,
          data.departmentId !== undefined ? data.departmentId : current.departmentId, 
          data.routingRoleId !== undefined ? data.routingRoleId : current.routingRoleId, 
          data.assignedMembershipId !== undefined ? data.assignedMembershipId : current.assignedMembershipId,
          actorMembershipId, conv.version
        ]
      );

      await this.db.query(
        `INSERT INTO outbox_events (id, tenant_id, name, payload) VALUES ($1, $2, $3, $4)`,
        [
          crypto.randomUUID(),
          tenantId, 
          'inbox.conversation.assigned', 
          JSON.stringify({
            conversationId: conversationId,
            toDepartmentId: data.departmentId !== undefined ? data.departmentId : current.departmentId,
            toRoutingRoleId: data.routingRoleId !== undefined ? data.routingRoleId : current.routingRoleId,
            toMembershipId: data.assignedMembershipId !== undefined ? data.assignedMembershipId : current.assignedMembershipId,
            actorMembershipId,
            version: conv.version
          })
        ]
      );
    }

    return conv;
  }

  async updateReadState(
    tenantId: string,
    conversationId: string,
    membershipId: string,
    lastReadSequence: string
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO conversation_read_states (tenant_id, conversation_id, membership_id, last_read_sequence, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (tenant_id, conversation_id, membership_id)
       DO UPDATE SET last_read_sequence = EXCLUDED.last_read_sequence, updated_at = NOW()
       WHERE conversation_read_states.last_read_sequence < EXCLUDED.last_read_sequence`,
      [tenantId, conversationId, membershipId, lastReadSequence]
    );
  }

  private mapToDoc(doc: any): Conversation {
    return {
      id: doc.id,
      tenantId: doc.tenant_id,
      contactId: doc.contact_id,
      subject: doc.subject,
      source: doc.source as any,
      channelReference: doc.channel_reference,
      status: doc.status as any,
      departmentId: doc.department_id,
      routingRoleId: doc.routing_role_id,
      assignedMembershipId: doc.assigned_membership_id,
      createdByMembershipId: doc.created_by_membership_id,
      version: doc.version,
      lastActivityAt: doc.last_activity_at.toISOString(),
      closedAt: doc.closed_at ? doc.closed_at.toISOString() : null,
      createdAt: doc.created_at.toISOString(),
      updatedAt: doc.updated_at.toISOString(),
    };
  }
}
