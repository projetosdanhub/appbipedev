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
    const doc = rows[0];
    
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
  
  async findByContactId(contactId: string, tenantId: string): Promise<Conversation[]> {
    const rows = await this.db.query(
      `SELECT * FROM conversations WHERE contact_id = $1 AND tenant_id = $2 ORDER BY last_activity_at DESC`,
      [contactId, tenantId]
    );
    
    return rows.map(doc => ({
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
    }));
  }
}
