import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ContactService } from "../application/contact.service.js";
import { TeamService } from "../../04-team/application/team.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCrmContactSchema, updateCrmContactSchema, assignmentTargetSchema, claimResourceBodySchema } from "@bipesend/contracts";

export function contactRoutes(
  fastify: FastifyInstance,
  db: Database,
  contactService: ContactService,
  teamService: TeamService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/contacts",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        const query = request.query as { limit?: string, offset?: string };
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        const offset = query.offset ? parseInt(query.offset, 10) : 0;
        
        const contacts = await contactService.listContacts(request.tenantContext, limit, offset);
        return reply.status(200).send({ data: contacts });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/contacts",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCrmContactSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        const contact = await contactService.createContact(request.tenantContext, parsed.data);
        return reply.status(201).send({ data: contact });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/contacts/:contactId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { contactId: string };
      try {
        const contact = await contactService.getContact(request.tenantContext, params.contactId);
        return reply.status(200).send({ data: contact });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/api/v1/tenants/:tenantId/contacts/:contactId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCrmContactSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { contactId: string };
      const body = request.body as any;
      if (typeof body.expectedVersion !== "number") {
        return reply.status(400).send({ error: "Optimistic locking expectedVersion required" });
      }

      try {
        const contact = await contactService.updateContact(request.tenantContext, params.contactId, body.expectedVersion, parsed.data);
        return reply.status(200).send({ data: contact });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
        if (e.message === "CONCURRENCY_CONFLICT") return reply.status(409).send({ error: "Contact was updated by another user" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.delete(
    "/api/v1/tenants/:tenantId/contacts/:contactId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { contactId: string };
      try {
        await contactService.deleteContact(request.tenantContext, params.contactId);
        return reply.status(204).send();
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
  fastify.get(
    "/api/v1/tenants/:tenantId/contacts/:contactId/assignment-candidates",
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
    "/api/v1/tenants/:tenantId/contacts/:contactId/assignment",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const parsed = assignmentTargetSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { contactId: string };
      try {
        const contact = await contactService.assign(
          request.tenantContext, 
          params.contactId, 
          parsed.data.expectedVersion, 
          parsed.data.departmentId, 
          parsed.data.routingRoleId, 
          parsed.data.assignedMembershipId
        );
        return reply.status(200).send({ data: contact });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
        if (e.message === "CONFLICT") return reply.status(409).send({ error: "Conflict or version mismatch" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/contacts/:contactId/assignment/claim",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const parsed = claimResourceBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { contactId: string };
      try {
        const contact = await contactService.claim(request.tenantContext, params.contactId, parsed.data.expectedVersion);
        return reply.status(200).send({ data: contact });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
        if (e.message === "CONFLICT") return reply.status(409).send({ error: "Conflict or version mismatch" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/contacts/:contactId/assignment/release",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      const parsed = claimResourceBodySchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { contactId: string };
      try {
        const contact = await contactService.release(request.tenantContext, params.contactId, parsed.data.expectedVersion);
        return reply.status(200).send({ data: contact });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
        if (e.message === "CONFLICT") return reply.status(409).send({ error: "Conflict or version mismatch" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
