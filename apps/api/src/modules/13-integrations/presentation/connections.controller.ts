import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { Database } from "../../00-shared/infrastructure/database.js";
import type { EvolutionService } from "../application/evolution.service.js";

export function connectionsRoutes(app: FastifyInstance, db: Database, evolutionService: EvolutionService) {
  // GET /api/v1/connections
  app.get("/api/v1/connections", async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    try {
      const connections = await db.query(
        "SELECT id, name, provider, status, qrcode, created_at FROM connections WHERE tenant_id = $1 ORDER BY created_at DESC",
        [tenantId]
      );
      return reply.send({ connections });
    } catch (error) {
      req.log.error(error, "Failed to list connections");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  // POST /api/v1/connections/whatsapp
  app.post("/api/v1/connections/whatsapp", async (req: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { name } = req.body as { name: string };
    if (!name) {
      return reply.status(400).send({ error: "Name is required" });
    }

    try {
      const result = await evolutionService.createInstance(tenantId, name);
      return reply.send(result);
    } catch (error: any) {
      req.log.error(error, "Failed to create whatsapp connection");
      return reply.status(500).send({ error: error.message });
    }
  });
}
