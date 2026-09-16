import { Database } from "../../00-shared/infrastructure/database.js";
import { CreateConversation, Conversation, Message, AddInternalNote } from "@bipesend/contracts";
import { ConversationRepository } from "../infrastructure/conversation.repository.js";
import { MessageRepository } from "../infrastructure/message.repository.js";

export class InboxService {
  constructor(private db: Database) {}

  async createConversation(tenantId: string, authorMembershipId: string, data: CreateConversation): Promise<Conversation> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.create(data, tenantId, authorMembershipId);
  }

  async getConversationsByContact(tenantId: string, contactId: string): Promise<Conversation[]> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.findByContactId(contactId, tenantId);
  }

  async getConversation(tenantId: string, conversationId: string): Promise<Conversation | null> {
    const conversationRepo = new ConversationRepository(this.db);
    return conversationRepo.findById(conversationId, tenantId);
  }

  async addInternalNote(tenantId: string, conversationId: string, authorMembershipId: string, data: AddInternalNote): Promise<Message> {
    return this.db.withTransaction(async (txDb) => {
      const messageRepo = new MessageRepository(txDb);
      return messageRepo.createInternalNote(data, tenantId, conversationId, authorMembershipId);
    });
  }

  async getMessages(tenantId: string, conversationId: string): Promise<Message[]> {
    const messageRepo = new MessageRepository(this.db);
    return messageRepo.findByConversationId(conversationId, tenantId);
  }
}
