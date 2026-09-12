/**
 * INF-003 — Health e readiness endpoints.
 *
 * /health retorna apenas liveness.
 * /ready verifica dependencias, mas nunca devolve mensagens brutas de infraestrutura.
 */

import type { FastifyInstance } from "fastify";
import { Client as PgClient } from "pg";
import { Redis } from "ioredis";

interface DependencyStatus {
  name: string;
  status: "ok" | "error";
  latencyMs?: number;
}

async function checkPostgres(databaseUrl: string): Promise<DependencyStatus> {
  const start = Date.now();
  const client = new PgClient({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return { name: "postgresql", status: "ok", latencyMs: Date.now() - start };
  } catch {
    return { name: "postgresql", status: "error", latencyMs: Date.now() - start };
  } finally {
    await client.end().catch(() => {});
  }
}

async function checkRedis(redisUrl: string): Promise<DependencyStatus> {
  const start = Date.now();
  const redis = new Redis(redisUrl, {
    connectTimeout: 3000,
    maxRetriesPerRequest: 0,
    lazyConnect: true,
  });
  try {
    await redis.connect();
    await redis.ping();
    return { name: "redis", status: "ok", latencyMs: Date.now() - start };
  } catch {
    return { name: "redis", status: "error", latencyMs: Date.now() - start };
  } finally {
    await redis.quit().catch(() => {});
  }
}

export async function registerHealthRoutes(
  app: FastifyInstance
): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"] || "";
  const redisUrl = process.env["REDIS_URL"] || "";

  app.get("/health", async (_request, reply) => {
    reply.header("cache-control", "no-store");
    return reply.status(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get("/ready", async (_request, reply) => {
    const [pg, redis] = await Promise.all([
      checkPostgres(databaseUrl),
      checkRedis(redisUrl),
    ]);

    const dependencies = [pg, redis];
    const allOk = dependencies.every((d) => d.status === "ok");

    reply.header("cache-control", "no-store");
    return reply.status(allOk ? 200 : 503).send({
      status: allOk ? "ready" : "degraded",
      timestamp: new Date().toISOString(),
      dependencies,
    });
  });
}
