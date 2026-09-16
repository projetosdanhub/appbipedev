import { Conversation, CreateConversation } from "@bipesend/contracts";

export class ConversationEntity {
  static create(data: CreateConversation, tenantId: string, createdByMembershipId: string): Conversation {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      tenantId,
      contactId: data.contactId,
      subject: data.subject ?? null,
      source: data.source,
      channelReference: data.channelReference ?? null,
      status: "open",
      departmentId: data.departmentId ?? null,
      routingRoleId: data.routingRoleId ?? null,
      assignedMembershipId: data.assignedMembershipId ?? null,
      createdByMembershipId,
      version: 1,
      lastActivityAt: now,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
    };
  }
}
