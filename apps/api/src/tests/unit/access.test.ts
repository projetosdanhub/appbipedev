import { test } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {
  createApiKeyMiddleware,
  createTenantMiddleware,
  createWebhookHmacMiddleware,
} from "../../modules/00-shared/presentation/auth.middleware.js";
import { Database } from "../../modules/00-shared/infrastructure/database.js";
import type { Pool } from "pg";

test("internal key rejects prefix-only credentials and accepts only the configured secret", async () => {
  const app = Fastify(),
    key = "internal-test-key-".repeat(3);
  app.get(
    "/internal",
    { preHandler: createApiKeyMiddleware(key) },
    async () => ({ ok: true }),
  );
  assert.equal(
    (
      await app.inject({
        url: "/internal",
        headers: { "x-api-key": "bipesend_fake" },
      })
    ).statusCode,
    401,
  );
  assert.equal(
    (await app.inject({ url: "/internal", headers: { "x-api-key": key } }))
      .statusCode,
    200,
  );
  await app.close();
});
test("webhook rejects missing raw bytes and short invalid signatures without throwing", async () => {
  const app = Fastify();
  app.post(
    "/hook",
    { preHandler: createWebhookHmacMiddleware("test-secret-".repeat(4)) },
    async () => ({ ok: true }),
  );
  assert.equal(
    (
      await app.inject({
        method: "POST",
        url: "/hook",
        headers: { "x-webhook-signature": "a" },
        payload: { a: 1 },
      })
    ).statusCode,
    401,
  );
  await app.close();
});
test("tenant selector alone cannot grant access", async () => {
  const app = Fastify();
  let queries = 0;
  const db = {
    withTransaction: async (fn: (db: unknown) => unknown) =>
      fn({
        query: async () => {
          queries++;
          return [];
        },
      }),
  } as unknown as Database;
  app.addHook("preHandler", async (req) => {
    req.user = {
      id: "11111111-1111-4111-8111-111111111111",
    } as typeof req.user;
  });
  app.get("/tenant", { preHandler: createTenantMiddleware(db) }, async () => ({
    ok: true,
  }));
  assert.equal((await app.inject({ url: "/tenant" })).statusCode, 400);
  assert.equal(
    (
      await app.inject({
        url: "/tenant",
        headers: { "x-tenant-id": "22222222-2222-4222-8222-222222222222" },
      })
    ).statusCode,
    403,
  );
  assert.equal(queries, 1);
  await app.close();
});
test("tenant transaction binds all statements to one connection and rolls back on failure", async () => {
  const statements: string[] = [],
    client = {
      query: async (sql: string) => {
        statements.push(sql);
        return { rows: [] };
      },
      release: () => statements.push("RELEASE"),
    };
  const pool = {
    connect: async () => client,
    query: async () => {
      throw new Error("GLOBAL_POOL_USED");
    },
  } as unknown as Pool;
  const db = new Database(pool);
  await assert.rejects(
    () =>
      db.withTransaction(async (tx) => {
        await tx.query("INSERT business");
        throw new Error("ABORT");
      }, "22222222-2222-4222-8222-222222222222"),
    /ABORT/,
  );
  assert.deepEqual(statements, [
    "BEGIN",
    "SELECT set_config('app.current_tenant_id', $1, true)",
    "INSERT business",
    "ROLLBACK",
    "RELEASE",
  ]);
});

test("legacy browser recovery and login cannot bypass canonical Auth.js controls", async () => {
  const { authRoutes } = await import(
    "../../modules/01-identity/presentation/auth.controller.js"
  );
  const app = Fastify();
  authRoutes(app);
  for (const path of [
    "register",
    "login",
    "logout",
    "verify-email",
    "request-password-reset",
    "reset-password",
  ]) {
    const response = await app.inject({
      method: "POST",
      url: `/auth/${path}`,
      payload: { token: "123456", newPassword: "Password!" },
    });
    assert.equal(response.statusCode, 410);
    assert.equal(response.json().error.code, "SERVICE_UNAVAILABLE");
  }
  await app.close();
});
