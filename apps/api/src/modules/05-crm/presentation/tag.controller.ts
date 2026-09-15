import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { TagService } from "../application/tag.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCrmTagSchema, updateCrmTagSchema } from "@bipesend/contracts";

export function tagRoutes(
  fastify: FastifyInstance,
  db: Database,
  tagService: TagService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/tags",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        const query = request.query as { limit?: string, offset?: string };
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        const offset = query.offset ? parseInt(query.offset, 10) : 0;
        
        const tags = await tagService.getTags(request.tenantContext, { limit, offset });
        return reply.status(200).send({ data: tags.data, total: tags.total });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/tags",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCrmTagSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        const tag = await tagService.createTag(request.tenantContext, parsed.data);
        return reply.status(201).send({ data: tag });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/tags/:tagId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { tagId: string };
      try {
        const tag = await tagService.getTag(request.tenantContext, params.tagId);
        if (!tag) return reply.status(404).send({ error: "Tag not found" });
        return reply.status(200).send({ data: tag });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.patch(
    "/api/v1/tenants/:tenantId/tags/:tagId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCrmTagSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { tagId: string };
      try {
        const tag = await tagService.updateTag(request.tenantContext, params.tagId, parsed.data);
        return reply.status(200).send({ data: tag });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.delete(
    "/api/v1/tenants/:tenantId/tags/:tagId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { tagId: string };
      try {
        await tagService.deleteTag(request.tenantContext, params.tagId);
        return reply.status(204).send();
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/api/v1/tenants/:tenantId/contacts/:contactId/tags/:tagId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { contactId: string; tagId: string };
      try {
        await tagService.assignTagToContact(request.tenantContext, params.contactId, params.tagId);
        return reply.status(204).send();
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.delete(
    "/api/v1/tenants/:tenantId/contacts/:contactId/tags/:tagId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { contactId: string; tagId: string };
      try {
        await tagService.removeTagFromContact(request.tenantContext, params.contactId, params.tagId);
        return reply.status(204).send();
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
