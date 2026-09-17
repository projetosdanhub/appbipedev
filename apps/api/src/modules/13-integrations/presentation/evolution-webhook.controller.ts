import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { Database } from "../../00-shared/infrastructure/database.js";
import type { EvolutionService } from "../application/evolution.service.js";

export function evolutionWebhookRoutes(
  app: FastifyInstance,
  db: Database,
  evolutionService: EvolutionService,
) {
  app.post("/api/v1/webhooks/evolution", async (req: FastifyRequest, reply: FastifyReply) => {
    const payload = req.body as any;

    if (!payload || !payload.event || !payload.instance) {
      return reply.status(400).send({ error: "Invalid webhook payload" });
    }

    try {
      if (payload.event === "messages.upsert") {
        await evolutionService.handleMessagesUpsert(payload.instance, payload.data);
      } else if (payload.event === "call") {
        await evolutionService.handleCall(payload.instance, payload.data);
      } else if (payload.event === "connection.update") {
        await evolutionService.handleConnectionUpdate(payload.instance, payload.data);
      } else if (payload.event === "qrcode.updated") {
        await evolutionService.handleQrcodeUpdated(payload.instance, payload.data);
      }
      
      return reply.status(200).send({ success: true });
    } catch (error) {
      req.log.error(error, "Failed to handle evolution webhook");
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });
}
