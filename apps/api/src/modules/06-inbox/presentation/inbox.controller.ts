import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { InboxService } from "../application/inbox.service.js";
import { TeamService } from "../../04-team/application/team.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { 
  addInternalNoteSchema, 
  createConversationSchema, 
  updateConversationSchema,
  sendOutboundMessageSchema,
  assignmentTargetSchema,
  claimResourceBodySchema
} from "@bipesend/contracts";

export function inboxRoutes(
  fastify: FastifyInstance,
  db: Database,
  inboxService: InboxService,
  teamService: TeamService
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
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Send outbound message
  fastify.post(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/messages",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      
      const parsed = sendOutboundMessageSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Validation failed", details: parsed.error.issues });
      }

      try {
        const conversation = await inboxService.getConversation(
          request.tenantContext.tenantId,
          conversationId
        );
        if (!conversation) {
          return reply.status(404).send({ error: "Conversation not found" });
        }

        const msg = await inboxService.sendOutboundMessage(
          request.tenantContext.tenantId,
          conversationId,
          request.tenantContext.membershipId,
          parsed.data
        );
        return reply.status(201).send({ data: msg });
      } catch (_error: any) {
        request.log.error(_error);
        return reply.status(500).send({ error: _error.message || "Internal server error" });
      }
    }
  );

  // Get all conversations
  fastify.get(
    "/api/v1/tenants/:tenantId/conversations",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      try {
        const conversations = await inboxService.getAllConversations(
          request.tenantContext.tenantId
        );
        return reply.status(200).send({ data: conversations });
      } catch (_error: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Get messages for a conversation
  fastify.get(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/messages",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      const query = request.query as any;
      
      try {
        const messages = await inboxService.getMessages(
          request.tenantContext.tenantId,
          conversationId,
          {
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
            afterSequence: query.afterSequence,
            beforeSequence: query.beforeSequence
          }
        );
        return reply.status(200).send({ data: messages });
      } catch (_error: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update conversation status
  fastify.patch(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/status",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      const body = request.body as any;
      
      try {
        const conversation = await inboxService.updateConversationStatus(
          request.tenantContext.tenantId,
          conversationId,
          body.status,
          request.tenantContext.membershipId,
          body.reason,
          body.expectedVersion
        );
        return reply.status(200).send({ data: conversation });
      } catch (_error: any) {
        if (_error.message.includes('Conflict')) {
          return reply.status(409).send({ error: _error.message });
        }
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update conversation
  fastify.patch(
    "/api/v1/tenants/:tenantId/conversations/:conversationId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      const parsed = updateConversationSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({ error: "Invalid payload" });
      }
      
      try {
        const expectedVersion = (request.body as any).expectedVersion;
        if (!expectedVersion) {
          return reply.status(400).send({ error: "Missing expectedVersion" });
        }

        const conversation = await inboxService.updateConversation(
          request.tenantContext.tenantId,
          conversationId,
          expectedVersion,
          parsed.data,
          request.tenantContext.membershipId
        );
        return reply.status(200).send({ data: conversation });
      } catch (_error: any) {
        if (_error.message.includes('CONCURRENCY_CONFLICT')) {
          return reply.status(409).send({ error: "Version mismatch" });
        }
        if (_error.message.includes('NOT_FOUND')) {
          return reply.status(404).send({ error: "Not found" });
        }
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );

  // Update read state
  fastify.put(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/read-state",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const { conversationId } = request.params as { conversationId: string };
      const body = request.body as any;
      
      try {
        await inboxService.updateReadState(
          request.tenantContext.tenantId,
          conversationId,
          request.tenantContext.membershipId,
          body.lastReadSequence
        );
        return reply.status(204).send();
      } catch (_error: any) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
  fastify.get(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/assignment-candidates",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const query = request.query as { departmentId?: string };
      if (!query.departmentId) return reply.status(400).send({ error: "Missing departmentId query" });
      
      try {
        const candidates = await teamService.getAssignmentCandidates(request.tenantContext, query.departmentId);
        return reply.status(200).send({ data: candidates });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/assignment",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const parsed = assignmentTargetSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { conversationId: string };
      try {
        const conv = await inboxService.assign(
          request.tenantContext.tenantId, 
          params.conversationId, 
          parsed.data.expectedVersion, 
          parsed.data.departmentId, 
          parsed.data.routingRoleId, 
          parsed.data.assignedMembershipId,
          request.tenantContext.membershipId
        );
        return reply.status(200).send({ data: conv });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Conversation not found" });
        if (e.message === "CONCURRENCY_CONFLICT") return reply.status(409).send({ error: "Conflict or version mismatch" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/assignment/claim",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const parsed = claimResourceBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { conversationId: string };
      try {
        const conv = await inboxService.claim(request.tenantContext.tenantId, params.conversationId, parsed.data.expectedVersion, request.tenantContext.membershipId);
        return reply.status(200).send({ data: conv });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Conversation not found" });
        if (e.message === "CONFLICT" || e.message === "CONCURRENCY_CONFLICT") return reply.status(409).send({ error: "Conflict or version mismatch" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/conversations/:conversationId/assignment/release",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const parsed = claimResourceBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { conversationId: string };
      try {
        const conv = await inboxService.release(request.tenantContext.tenantId, params.conversationId, parsed.data.expectedVersion, request.tenantContext.membershipId);
        return reply.status(200).send({ data: conv });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Conversation not found" });
        if (e.message === "CONFLICT" || e.message === "CONCURRENCY_CONFLICT") return reply.status(409).send({ error: "Conflict or version mismatch" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
