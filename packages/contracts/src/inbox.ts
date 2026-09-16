import { z } from "zod";
const idSchema = z.string().uuid();

// --- Enums ---

export const conversationSourceSchema = z.enum([
  "internal_crm",
  "whatsapp",
  "instagram",
  "messenger",
  "email",
]);

export const conversationStatusSchema = z.enum([
  "open",
  "closed",
  "archived",
]);

export const messageKindSchema = z.enum([
  "internal_note",
  "customer_message",
  "system_event",
]);

export const messageDirectionSchema = z.enum([
  "internal",
  "inbound",
  "outbound",
]);

export const messageStateSchema = z.enum([
  "sending",
  "sent",
  "delivered",
  "read",
  "failed",
  "saved", // for internal notes
]);

// --- Schemas ---

export const conversationSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  contactId: idSchema,
  subject: z.string().max(255).nullable(),
  source: conversationSourceSchema,
  channelReference: z.string().max(255).nullable(),
  status: conversationStatusSchema,
  departmentId: idSchema.nullable(),
  routingRoleId: idSchema.nullable(),
  assignedMembershipId: idSchema.nullable(),
  createdByMembershipId: idSchema,
  version: z.number().int().positive(),
  lastActivityAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export const createConversationSchema = z.object({
  contactId: idSchema,
  subject: z.string().max(255).nullable().optional(),
  source: conversationSourceSchema.default("internal_crm"),
  channelReference: z.string().max(255).nullable().optional(),
  departmentId: idSchema.nullable().optional(),
  routingRoleId: idSchema.nullable().optional(),
  assignedMembershipId: idSchema.nullable().optional(),
}).strict();

export const messageSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  conversationId: idSchema,
  sequence: z.string().max(50),
  kind: messageKindSchema,
  direction: messageDirectionSchema,
  authorMembershipId: idSchema.nullable(),
  externalSenderReference: z.string().max(255).nullable(),
  text: z.string(),
  state: messageStateSchema,
  clientMessageId: z.string().max(255).nullable(),
  createdAt: z.string().datetime(),
}).strict();

export const addInternalNoteSchema = z.object({
  text: z.string().min(1),
  clientMessageId: z.string().max(255).optional(),
}).strict();

export const conversationReadStateSchema = z.object({
  tenantId: idSchema,
  conversationId: idSchema,
  membershipId: idSchema,
  lastReadSequence: z.string().max(50),
  updatedAt: z.string().datetime(),
}).strict();

export const conversationStatusHistorySchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  conversationId: idSchema,
  fromStatus: conversationStatusSchema.nullable(),
  toStatus: conversationStatusSchema,
  actorMembershipId: idSchema.nullable(),
  reason: z.string().max(1000).nullable(),
  occurredAt: z.string().datetime(),
  version: z.number().int().positive(),
}).strict();

// --- Types ---

export type ConversationSource = z.infer<typeof conversationSourceSchema>;
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;
export type MessageKind = z.infer<typeof messageKindSchema>;
export type MessageDirection = z.infer<typeof messageDirectionSchema>;
export type MessageState = z.infer<typeof messageStateSchema>;

export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;

export type Message = z.infer<typeof messageSchema>;
export type AddInternalNote = z.infer<typeof addInternalNoteSchema>;

export type ConversationReadState = z.infer<typeof conversationReadStateSchema>;
export type ConversationStatusHistory = z.infer<typeof conversationStatusHistorySchema>;
