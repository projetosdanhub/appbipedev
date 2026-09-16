import { Message, AddInternalNote } from "@bipesend/contracts";

export class MessageEntity {
  static createInternalNote(data: AddInternalNote, tenantId: string, conversationId: string, authorMembershipId: string, sequence: string): Message {
    return {
      id: crypto.randomUUID(),
      tenantId,
      conversationId,
      sequence,
      kind: "internal_note",
      direction: "internal",
      authorMembershipId,
      externalSenderReference: null,
      text: data.text,
      state: "saved",
      clientMessageId: data.clientMessageId ?? null,
      createdAt: new Date().toISOString(),
    };
  }
}
