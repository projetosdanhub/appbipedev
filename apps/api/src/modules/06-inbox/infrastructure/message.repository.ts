import { Database } from "../../00-shared/infrastructure/database.js";
import { Message, AddInternalNote } from "@bipesend/contracts";
import { MessageEntity } from "../domain/message.entity.js";

export class MessageRepository {
  constructor(private readonly db: Database) {}

  async createInternalNote(data: AddInternalNote, tenantId: string, conversationId: string, authorMembershipId: string): Promise<Message> {
    const sequence = new Date().toISOString(); // Using ISO string for sortable sequence
    const entity = MessageEntity.createInternalNote(data, tenantId, conversationId, authorMembershipId, sequence);
    
    await this.db.query(
      `INSERT INTO messages (
        id, tenant_id, conversation_id, sequence, kind, direction,
        author_membership_id, external_sender_reference, text, state,
        client_message_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        entity.id, entity.tenantId, entity.conversationId, entity.sequence,
        entity.kind, entity.direction, entity.authorMembershipId,
        entity.externalSenderReference, entity.text, entity.state,
        entity.clientMessageId, entity.createdAt
      ]
    );
    
    // Update conversation lastActivityAt
    await this.db.query(
      `UPDATE conversations SET last_activity_at = $1 WHERE id = $2 AND tenant_id = $3`,
      [entity.createdAt, conversationId, tenantId]
    );
    
    return entity;
  }
  async createOutboundMessage(
    data: { text?: string; mediaUrl?: string; mediaType?: string; mediaName?: string; clientMessageId?: string },
    tenantId: string,
    conversationId: string,
    authorMembershipId: string
  ): Promise<Message> {
    const sequence = new Date().toISOString();
    const entity = MessageEntity.createOutboundMessage(data, tenantId, conversationId, authorMembershipId, sequence);
    
    await this.db.query(
      `INSERT INTO messages (
        id, tenant_id, conversation_id, sequence, kind, direction,
        author_membership_id, external_sender_reference, text, state,
        client_message_id, created_at, has_media, media_url, media_type, media_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        entity.id, entity.tenantId, entity.conversationId, entity.sequence,
        entity.kind, entity.direction, entity.authorMembershipId,
        entity.externalSenderReference, entity.text, entity.state,
        entity.clientMessageId, entity.createdAt,
        entity.hasMedia, entity.mediaUrl, entity.mediaType, entity.mediaName
      ]
    );
    
    await this.db.query(
      `UPDATE conversations SET last_activity_at = $1 WHERE id = $2 AND tenant_id = $3`,
      [entity.createdAt, conversationId, tenantId]
    );
    
    return entity;
  }
  
  async findByConversationId(
    conversationId: string, 
    tenantId: string, 
    options?: { afterSequence?: string; beforeSequence?: string; limit?: number }
  ): Promise<Message[]> {
    let query = `SELECT * FROM messages WHERE conversation_id = $1 AND tenant_id = $2`;
    const params: any[] = [conversationId, tenantId];
    
    if (options?.afterSequence) {
      params.push(options.afterSequence);
      query += ` AND sequence > $${params.length}`;
    } else if (options?.beforeSequence) {
      params.push(options.beforeSequence);
      query += ` AND sequence < $${params.length}`;
    }
    
    query += ` ORDER BY sequence ASC`;
    
    if (options?.limit) {
      params.push(options.limit);
      query += ` LIMIT $${params.length}`;
    }
    
    const rows = await this.db.query(query, params);
    
    return rows.map(doc => ({
      id: doc.id,
      tenantId: doc.tenant_id,
      conversationId: doc.conversation_id,
      sequence: doc.sequence,
      kind: doc.kind as any,
      direction: doc.direction as any,
      authorMembershipId: doc.author_membership_id,
      externalSenderReference: doc.external_sender_reference,
      text: doc.text,
      hasMedia: doc.has_media,
      mediaUrl: doc.media_url,
      mediaType: doc.media_type,
      mediaName: doc.media_name,
      mediaSize: doc.media_size,
      state: doc.state as any,
      clientMessageId: doc.client_message_id,
      createdAt: doc.created_at.toISOString(),
    }));
  }
}
