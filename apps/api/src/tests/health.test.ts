/**
 * Testes mínimos dos endpoints /health e /ready.
 *
 * Usa node:test nativo para zero dependências extras.
 * /ready pode falhar se Docker não estiver rodando — isso é esperado.
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify, { type FastifyInstance } from "fastify";
import { registerHealthRoutes } from "../routes/health.js";

describe("/health and /ready endpoints", () => {
  let app: FastifyInstance;

  before(async () => {
    // Configura variáveis mínimas para o teste
    process.env["DATABASE_URL"] =
      process.env["DATABASE_URL"] ||
      "postgresql://bipesend:bipesend_dev@localhost:5432/bipesend";
    process.env["REDIS_URL"] =
      process.env["REDIS_URL"] || "redis://localhost:6379";

    app = Fastify({ logger: false });
    await registerHealthRoutes(app);
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it("GET /health returns 200 with status ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    assert.equal(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.equal(body.status, "ok");
    assert.ok(body.timestamp, "should include timestamp");
    assert.ok(typeof body.uptime === "number", "should include uptime");

    // Não deve conter segredos
    const bodyStr = JSON.stringify(body);
    assert.ok(!bodyStr.includes("password"), "must not expose password");
    assert.ok(!bodyStr.includes("secret"), "must not expose secret");
  });

  it("GET /ready returns dependencies array", async () => {
    const res = await app.inject({ method: "GET", url: "/ready" });
    // Status pode ser 200 (ok) ou 503 (degraded) dependendo do Docker
    assert.ok([200, 503].includes(res.statusCode));

    const body = JSON.parse(res.body);
    assert.ok(Array.isArray(body.dependencies), "should list dependencies");
    assert.ok(body.dependencies.length >= 2, "should check at least pg + redis");

    for (const dep of body.dependencies) {
      assert.ok(dep.name, "dependency should have name");
      assert.ok(
        ["ok", "error"].includes(dep.status),
        "dependency status should be ok or error"
      );
      // Mensagens brutas de infraestrutura nunca chegam ao response
      assert.equal("message" in dep, false);
      const depStr = JSON.stringify(dep);
      assert.ok(!depStr.includes("bipesend_dev"), "must not expose db password");
      assert.ok(!depStr.includes("ECONN"), "must not expose raw network errors");
      assert.ok(!depStr.includes("/var/"), "must not expose filesystem paths");
    }
  });

  it("GET /health does not expose secrets", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    const secrets = [
      "AUTH_SESSION_SECRET",
      "DATA_ENCRYPTION_KEY",
      "WEBHOOK_SIGNING_SECRET",
      "bipesend_dev",
      "minio_dev_only",
    ];
    for (const s of secrets) {
      assert.ok(!res.body.includes(s), `must not contain ${s}`);
    }
  });
});
