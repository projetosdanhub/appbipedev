import type { FastifyInstance } from "fastify";
import { HealthService } from "../application/health.service.js";

export async function registerHealthController(app: FastifyInstance): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"] || "";
  const redisUrl = process.env["REDIS_URL"] || "";
  const healthService = new HealthService(databaseUrl, redisUrl);

  app.get("/health", async (_request, reply) => {
    reply.header("cache-control", "no-store");
    return reply.status(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get("/ready", async (_request, reply) => {
    const result = await healthService.checkAll();
    
    reply.header("cache-control", "no-store");
    return reply.status(result.status === "ready" ? 200 : 503).send({
      status: result.status,
      timestamp: new Date().toISOString(),
      dependencies: result.dependencies,
    });
  });
}
