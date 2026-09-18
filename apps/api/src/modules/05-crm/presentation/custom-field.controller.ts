import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CustomFieldService } from "../application/custom-field.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCustomFieldSchema, updateCustomFieldSchema } from "@bipesend/contracts";
import { assertPermission } from "@bipesend/auth";

export function customFieldRoutes(
  fastify: FastifyInstance,
  db: Database,
  customFieldService: CustomFieldService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/custom-fields",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        assertPermission(request.tenantContext, "crm.contacts.read");
        
        const query = request.query as { entityType?: string };
        const entityType = query.entityType || "contact";
        
        const fields = await customFieldService.list(request.tenantContext.tenantId, entityType);
        return reply.status(200).send({ data: fields });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/custom-fields",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCustomFieldSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        assertPermission(request.tenantContext, "crm.contacts.update"); // Modifying schema requires update permission
        const field = await customFieldService.create(request.tenantContext, parsed.data);
        return reply.status(201).send({ data: field });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/api/v1/tenants/:tenantId/custom-fields/:id",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCustomFieldSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { id: string };
      try {
        assertPermission(request.tenantContext, "crm.contacts.update");
        const field = await customFieldService.update(request.tenantContext, params.id, parsed.data);
        return reply.status(200).send({ data: field });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Field not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.delete(
    "/api/v1/tenants/:tenantId/custom-fields/:id",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { id: string };
      try {
        assertPermission(request.tenantContext, "crm.contacts.update");
        await customFieldService.delete(request.tenantContext.tenantId, params.id);
        return reply.status(204).send();
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Field not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
