/**
 * INF-003 — Health e readiness endpoints.
 *
 * GET /health  → verifica que a API está ativa, sem segredos.
 * GET /ready   → verifica dependências (PostgreSQL, Redis) sem expor credenciais.
 */

import type { FastifyInstance } from "fastify";
import { Client as PgClient } from "pg";
import Redis from "ioredis";

interface DependencyStatus {
  name: string;
  status: "ok" | "error";
  latencyMs?: number;
  message?: string;
}

async function checkPostgres(databaseUrl: string): Promise<DependencyStatus> {
  const start = Date.now();
  const client = new PgClient({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return { name: "postgresql", status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      name: "postgresql",
      status: "error",
      latencyMs: Date.now() - start,
      message,
    };
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      name: "redis",
      status: "error",
      latencyMs: Date.now() - start,
      message,
    };
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

    return reply.status(allOk ? 200 : 503).send({
      status: allOk ? "ready" : "degraded",
      timestamp: new Date().toISOString(),
      dependencies,
    });
  });
}
