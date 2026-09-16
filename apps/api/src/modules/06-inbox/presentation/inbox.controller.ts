import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { InboxService } from "../application/inbox.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createConversationSchema, addInternalNoteSchema } from "@bipesend/contracts";

export function inboxRoutes(
  fastify: FastifyInstance,
  db: Database,
  inboxService: InboxService
) {
  // Create a new conversation
  fastify.post(
    "/api/v1/tenants/:tenantId/conversations",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createConversationSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Validation failed", details: parsed.error.issues });
      }

      try {
        const conversation = await inboxService.createConversation(
          request.tenantContext.tenantId,
          request.tenantContext.membershipId,
          parsed.data
        );
        return reply.status(201).send({ data: conversation });
      } catch (e: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // List conversations for a contact
  fastify.get(
    "/api/v1/tenants/:tenantId/contacts/:contactId/conversations",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { contactId } = request.params as { contactId: string };
      
      try {
        const conversations = await inboxService.getConversationsByContact(
          request.tenantContext.tenantId,
          contactId
        );
        return reply.status(200).send({ data: conversations });
      } catch (e: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Get conversation and its messages
  fastify.get(
    "/api/v1/tenants/:tenantId/conversations/:conversationId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      
      try {
        const conversation = await inboxService.getConversation(
          request.tenantContext.tenantId,
          conversationId
        );
        if (!conversation) {
          return reply.status(404).send({ error: "Conversation not found" });
        }
        
        const messages = await inboxService.getMessages(
          request.tenantContext.tenantId,
          conversationId
        );
        
        return reply.status(200).send({ data: { ...conversation, messages } });
      } catch (e: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Add internal note
  fastify.post(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/notes",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      
      const parsed = addInternalNoteSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Validation failed", details: parsed.error.issues });
      }

      try {
        // Verify conversation belongs to tenant
        const conversation = await inboxService.getConversation(
          request.tenantContext.tenantId,
          conversationId
        );
        if (!conversation) {
          return reply.status(404).send({ error: "Conversation not found" });
        }

        const note = await inboxService.addInternalNote(
          request.tenantContext.tenantId,
          conversationId,
          request.tenantContext.membershipId,
          parsed.data
        );
        return reply.status(201).send({ data: note });
      } catch (e: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
