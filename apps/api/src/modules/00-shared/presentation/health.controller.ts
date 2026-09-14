import type { FastifyInstance } from "fastify";
import { HealthService } from "../application/health.service.js";

export async function registerHealthController(app: FastifyInstance): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"] || "";
  const redisUrl = process.env["REDIS_URL"] || "";
  const healthService = new HealthService(databaseUrl, redisUrl);

  app.get("/health", async (request, reply) => {
    reply.header("cache-control", "no-store");
    return reply.status(200).send({
      status: "ok",
      requestId: request.id,
    });
  });

  app.get("/ready", async (request, reply) => {
    const result = await healthService.checkAll();
    
    reply.header("cache-control", "no-store");
    const statusCode = result.status === "ok" ? 200 : 503;
    
    return reply.status(statusCode).send({
      status: result.status,
      dependencies: result.dependencies,
      requestId: request.id,
    });
  });
}
