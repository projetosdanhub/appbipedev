import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuditService } from "../application/audit.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { auditLogListParamsSchema } from "@bipesend/contracts";

export function auditRoutes(
  fastify: FastifyInstance,
  db: Database,
  auditService: AuditService
) {
  fastify.get(
    "/tenants/:tenantId/audit",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = auditLogListParamsSchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Invalid pagination params" });
      }

      try {
        const response = await auditService.listLogs(request.tenantContext, parsed.data);
        return reply.status(200).send(response);
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
