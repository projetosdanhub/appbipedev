import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ContactService } from "../application/contact.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCrmContactSchema, updateCrmContactSchema } from "@bipesend/contracts";

export function contactRoutes(
  fastify: FastifyInstance,
  db: Database,
  contactService: ContactService
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
      try {
        const contact = await contactService.updateContact(request.tenantContext, params.contactId, parsed.data);
        return reply.status(200).send({ data: contact });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Contact not found" });
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
}
