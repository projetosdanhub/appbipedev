import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotificationService } from "../application/notification.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";

export function notificationRoutes(
  fastify: FastifyInstance,
  db: Database,
  notificationService: NotificationService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/notifications",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      try {
        const notifs = await notificationService.getMyNotifications(request.tenantContext);
        return reply.status(200).send({ data: notifs });
      } catch (e: any) {
        return reply.status(500).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/notifications/:id/read",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { id: string };
      try {
        const success = await notificationService.markAsRead(request.tenantContext, params.id);
        if (!success) {
          return reply.status(404).send({ error: "Notification not found" });
        }
        return reply.status(200).send({ success: true });
      } catch (e: any) {
        return reply.status(500).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
