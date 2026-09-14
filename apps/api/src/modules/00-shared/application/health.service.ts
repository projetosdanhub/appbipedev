import { Client as PgClient } from "pg";
import { Redis } from "ioredis";

export interface DependencyStatus {
  name: string;
  status: "ok" | "error";
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
        name: "postgresql",
        status: "ok",
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        name: "postgresql",
        status: "error",
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
      return { name: "redis", status: "ok", latencyMs: Date.now() - start };
    } catch {
      return { name: "redis", status: "error", latencyMs: Date.now() - start };
    } finally {
      redis.disconnect();
    }
  }

  async checkAll(): Promise<{
    status: "ready" | "degraded";
    dependencies: DependencyStatus[];
  }> {
    const [pg, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);
    const dependencies = [pg, redis];
    const allOk = dependencies.every((d) => d.status === "ok");

    return {
      status: allOk ? "ready" : "degraded",
      dependencies,
    };
  }
}
