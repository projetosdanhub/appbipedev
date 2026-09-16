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
  
  async findByConversationId(conversationId: string, tenantId: string): Promise<Message[]> {
    const rows = await this.db.query(
      `SELECT * FROM messages WHERE conversation_id = $1 AND tenant_id = $2 ORDER BY sequence ASC`,
      [conversationId, tenantId]
    );
    
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
      state: doc.state as any,
      clientMessageId: doc.client_message_id,
      createdAt: doc.created_at.toISOString(),
    }));
  }
}
