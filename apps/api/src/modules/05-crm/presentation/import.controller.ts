import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ContactImportService } from "../application/contact-import.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createImportPreviewSchema, commitImportSchema } from "@bipesend/contracts";
import { assertPermission } from "@bipesend/auth";

export function importRoutes(
  fastify: FastifyInstance,
  db: Database,
  importService: ContactImportService
) {
  fastify.post(
    "/api/v1/tenants/:tenantId/imports/preview",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createImportPreviewSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        assertPermission(request.tenantContext, "crm.import.manage");
        
        const batch = await importService.createPreview(
          request.tenantContext,
          parsed.data
        );
        return reply.status(201).send({ data: batch });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/imports/:id/commit",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = commitImportSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { id: string };
      try {
        assertPermission(request.tenantContext, "crm.import.manage");
        
        const batch = await importService.commit(
          request.tenantContext,
          params.id,
          parsed.data
        );
        return reply.status(200).send({ data: batch });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Import batch not found" });
        if (e.message === "CONFLICT") return reply.status(409).send({ error: "Batch state conflict or expired" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/imports/:id",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { id: string };
      try {
        assertPermission(request.tenantContext, "crm.import.manage");
        
        const batch = await importService.getBatch(
          request.tenantContext.tenantId,
          params.id
        );
        return reply.status(200).send({ data: batch });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Import batch not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
