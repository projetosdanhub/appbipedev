import { Database } from "../../00-shared/infrastructure/database.js";
import { CreateConversation, Conversation, Message, AddInternalNote } from "@bipesend/contracts";
import { ConversationRepository } from "../infrastructure/conversation.repository.js";
import { MessageRepository } from "../infrastructure/message.repository.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";


export class InboxService {
  constructor(private db: Database, private gateway?: WebsocketGateway) {}

  async createConversation(tenantId: string, authorMembershipId: string, data: CreateConversation): Promise<Conversation> {
    const conversationRepo = new ConversationRepository(this.db);
    const conv = await conversationRepo.create(data, tenantId, authorMembershipId);
    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId: conv.id });
    return conv;
  }

  async getConversationsByContact(tenantId: string, contactId: string): Promise<Conversation[]> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.findByContactId(contactId, tenantId);
  }

  async getAllConversations(tenantId: string): Promise<Conversation[]> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.findAll(tenantId);
  }

  async getConversation(tenantId: string, conversationId: string): Promise<Conversation | null> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.findById(conversationId, tenantId);
  }

  async addInternalNote(tenantId: string, conversationId: string, authorMembershipId: string, data: AddInternalNote): Promise<Message> {
    const msg = await this.db.withTransaction(async (txDb) => {
      const messageRepo = new MessageRepository(txDb);
      return messageRepo.createInternalNote(data, tenantId, conversationId, authorMembershipId);
    });
    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId });
    return msg;
  }

  async sendOutboundMessage(tenantId: string, conversationId: string, authorMembershipId: string, data: { text?: string; mediaUrl?: string; mediaType?: string; mediaName?: string; clientMessageId?: string }): Promise<Message> {
    const msg = await this.db.withTransaction(async (txDb) => {
      const messageRepo = new MessageRepository(txDb);
      // The message is created with state = 'pending' by default in the DB schema/contracts
      return messageRepo.createOutboundMessage(data, tenantId, conversationId, authorMembershipId);
    });
    
    const conversation = await this.getConversation(tenantId, conversationId);
    if (!conversation) throw new Error("Conversation not found");
    const number = conversation.contactId;

    const { outboundMessagesQueue } = await import("../infrastructure/messages-queue.js");
    
    // Add job to BullMQ
    await outboundMessagesQueue.add(`send-${msg.id}`, {
      tenantId,
      conversationId,
      messageId: msg.id,
      contactNumber: number,
      data
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId });
    return msg;
  }

  async getMessages(
    tenantId: string, 
    conversationId: string,
    options?: { afterSequence?: string; beforeSequence?: string; limit?: number }
  ): Promise<Message[]> {
    const messageRepo = new MessageRepository(this.db);
    return messageRepo.findByConversationId(conversationId, tenantId, options);
  }

  async updateConversationStatus(
    tenantId: string,
    conversationId: string,
    newStatus: string,
    actorMembershipId: string,
    reason?: string,
    expectedVersion?: number
  ): Promise<Conversation> {
    const conv = await this.db.withTransaction(async (txDb) => {
      const conversationRepo = new ConversationRepository(txDb);
      return conversationRepo.updateStatus(txDb, tenantId, conversationId, newStatus, actorMembershipId, reason, expectedVersion);
    });
    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId });
    return conv;
  }

  async updateReadState(
    tenantId: string,
    conversationId: string,
    membershipId: string,
    lastReadSequence: string
  ): Promise<void> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.updateReadState(tenantId, conversationId, membershipId, lastReadSequence);
  }

  async updateConversation(
    tenantId: string,
    conversationId: string,
    expectedVersion: number,
    data: import("@bipesend/contracts").UpdateConversation,
    actorMembershipId: string
  ): Promise<Conversation> {
    const conv = await this.db.withTransaction(async (txDb) => {
      const conversationRepo = new ConversationRepository(txDb);
      return conversationRepo.update(tenantId, conversationId, expectedVersion, data, actorMembershipId);
    });
    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId });
    return conv;
  }

  async assign(
    tenantId: string, 
    conversationId: string, 
    expectedVersion: number, 
    departmentId: string | null, 
    routingRoleId: string | null, 
    assignedMembershipId: string | null,
    actorMembershipId: string
  ): Promise<Conversation> {
    const conv = await this.db.withTransaction(async (txDb) => {
      const conversationRepo = new ConversationRepository(txDb);
      return conversationRepo.update(
        tenantId, 
        conversationId, 
        expectedVersion, 
        { departmentId, routingRoleId, assignedMembershipId }, 
        actorMembershipId
      );
    });
    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId });
    return conv;
  }

  async claim(tenantId: string, conversationId: string, expectedVersion: number, actorMembershipId: string): Promise<Conversation> {
    const current = await this.getConversation(tenantId, conversationId);
    if (!current) throw new Error("NOT_FOUND");
    if (current.version !== expectedVersion) throw new Error("CONFLICT");

    const conv = await this.assign(
      tenantId, 
      conversationId, 
      expectedVersion, 
      current.departmentId, 
      current.routingRoleId, 
      actorMembershipId,
      actorMembershipId
    );
    return conv;
  }

  async release(tenantId: string, conversationId: string, expectedVersion: number, actorMembershipId: string): Promise<Conversation> {
    const current = await this.getConversation(tenantId, conversationId);
    if (!current) throw new Error("NOT_FOUND");
    if (current.version !== expectedVersion) throw new Error("CONFLICT");

    const conv = await this.assign(
      tenantId, 
      conversationId, 
      expectedVersion, 
      current.departmentId, 
      current.routingRoleId, 
      null,
      actorMembershipId
    );
    return conv;
  }
}
