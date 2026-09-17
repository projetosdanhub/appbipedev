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
      hasMedia: false,
      state: "saved",
      clientMessageId: data.clientMessageId ?? null,
      createdAt: new Date().toISOString(),
    };
  }
  static createOutboundMessage(
    data: { text?: string; mediaUrl?: string; mediaType?: string; mediaName?: string; clientMessageId?: string },
    tenantId: string,
    conversationId: string,
    authorMembershipId: string,
    sequence: string
  ): Message {
    return {
      id: crypto.randomUUID(),
      tenantId,
      conversationId,
      sequence,
      kind: "customer_message",
      direction: "outbound",
      authorMembershipId,
      externalSenderReference: null,
      text: data.text || "",
      hasMedia: !!data.mediaUrl,
      mediaUrl: data.mediaUrl ?? null,
      mediaType: data.mediaType ?? null,
      mediaName: data.mediaName ?? null,
      state: "sending",
      clientMessageId: data.clientMessageId ?? null,
      createdAt: new Date().toISOString(),
    };
  }
}
