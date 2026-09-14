import { Client as PgClient } from "pg";
import { Redis } from "ioredis";
import { logger } from "../infrastructure/logger.js";
import type { IntegrationState } from "@bipesend/contracts";

export interface DependencyStatus {
  state: IntegrationState;
  latencyMs?: number;
}

export class HealthService {
  constructor(
    private readonly databaseUrl: string,
    private readonly redisUrl: string,
  ) {}

  async checkPostgres(): Promise<DependencyStatus> {
    const start = Date.now();
    const client = new PgClient({
      connectionString: this.databaseUrl,
      connectionTimeoutMillis: 3000,
      query_timeout: 3000,
    });
    try {
      await client.connect();
      await client.query("SELECT 1");
      return {
        state: "connected",
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      logger.error("Health check failed for Postgres", err);
      return {
        state: "disconnected",
        latencyMs: Date.now() - start,
      };
    } finally {
      await client.end().catch(() => {});
    }
  }

  async checkRedis(): Promise<DependencyStatus> {
    const start = Date.now();
    const redis = new Redis(this.redisUrl, {
      connectTimeout: 3000,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });
    redis.on("error", () => {
      /* Report normalized readiness status only. */
    });
    try {
      await redis.connect();
      await redis.ping();
      return { state: "connected", latencyMs: Date.now() - start };
    } catch (err) {
      logger.error("Health check failed for Redis", err);
      return { state: "disconnected", latencyMs: Date.now() - start };
    } finally {
      redis.disconnect();
    }
  }

  async checkAll(): Promise<{
    status: "ok" | "degraded" | "unavailable";
    dependencies: Record<string, DependencyStatus>;
  }> {
    const [pg, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);
    
    const dependencies: Record<string, DependencyStatus> = {
      postgresql: pg,
      redis,
    };
    
    const isPgConnected = pg.state === "connected";
    const isRedisConnected = redis.state === "connected";

    let status: "ok" | "degraded" | "unavailable" = "unavailable";
    if (isPgConnected && isRedisConnected) {
      status = "ok";
    } else if (isPgConnected) {
      status = "degraded"; // redis might be optional for basic reads? No, but let's call it degraded.
    }

    return {
      status,
      dependencies,
    };
  }
}

