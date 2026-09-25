/**
 * Admin Credentials Controller — Rotas protegidas por SuperAdmin auth.
 *
 * Endpoints:
 *   GET  /api/v1/admin/credentials                   — Lista status de todos os providers
 *   GET  /api/v1/admin/credentials/:provider/status   — Status de um provider (sem secrets)
 *   POST /api/v1/admin/credentials/:provider          — Salva, cifra e valida credenciais
 *   DELETE /api/v1/admin/credentials/:provider        — Remove credenciais
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { CredentialsService } from "../application/credentials.service.js";

const VALID_PROVIDERS = ["evolution_api", "meta", "tiktok", "cloudflare_r2"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

function isValidProvider(p: string): p is Provider {
  return (VALID_PROVIDERS as readonly string[]).includes(p);
}

export function adminCredentialsRoutes(
  app: FastifyInstance,
  credentialsService: CredentialsService,
) {
  // ── GET /api/v1/admin/credentials — Lista status de todos os providers ──
  app.get("/api/v1/admin/credentials", async (request: FastifyRequest, reply: FastifyReply) => {
    // SuperAdmin guard
    if (!request.user?.isSuperadmin) {
      return reply.status(403).send({ error: "Forbidden: SuperAdmin only" });
    }

    const { CredentialsRepository } = await import(
      "../infrastructure/credentials.repository.js"
    );
    // O repo é criado internamente aqui para acesso direto ao DB
    // Em produção o ideal é injetar, mas funciona para a arquitetura atual
    const statuses = await credentialsService["repo"].getAllStatuses();

    return reply.send({ statuses });
  });

  // ── GET /api/v1/admin/credentials/:provider/status ──
  app.get(
    "/api/v1/admin/credentials/:provider/status",
    async (
      request: FastifyRequest<{ Params: { provider: string } }>,
      reply: FastifyReply,
    ) => {
      if (!request.user?.isSuperadmin) {
        return reply.status(403).send({ error: "Forbidden: SuperAdmin only" });
      }

      const { provider } = request.params;
      if (!isValidProvider(provider)) {
        return reply
          .status(400)
          .send({ error: `Provider inválido. Use: ${VALID_PROVIDERS.join(", ")}` });
      }

      const status = await credentialsService["repo"].getStatus(provider);
      return reply.send({
        provider,
        status: status?.status ?? "not_configured",
        lastValidatedAt: status?.lastValidatedAt ?? null,
      });
    },
  );

  // ── POST /api/v1/admin/credentials/:provider ──
  app.post(
    "/api/v1/admin/credentials/:provider",
    async (
      request: FastifyRequest<{
        Params: { provider: string };
        Body: { credentials: Record<string, string> };
      }>,
      reply: FastifyReply,
    ) => {
      if (!request.user?.isSuperadmin) {
        return reply.status(403).send({ error: "Forbidden: SuperAdmin only" });
      }

      const { provider } = request.params;
      if (!isValidProvider(provider)) {
        return reply
          .status(400)
          .send({ error: `Provider inválido. Use: ${VALID_PROVIDERS.join(", ")}` });
      }

      const body = request.body as { credentials?: Record<string, string> };
      if (!body?.credentials || typeof body.credentials !== "object") {
        return reply.status(400).send({ error: "Campo 'credentials' obrigatório." });
      }

      const result = await credentialsService.saveAndValidate(
        provider,
        body.credentials,
        request.user.id,
      );

      return reply.send(result);
    },
  );

  // ── PATCH /api/v1/admin/credentials/:provider/status ──
  app.patch(
    "/api/v1/admin/credentials/:provider/status",
    async (
      request: FastifyRequest<{
        Params: { provider: string };
        Body: { status: "active" | "inactive" };
      }>,
      reply: FastifyReply,
    ) => {
      if (!request.user?.isSuperadmin) {
        return reply.status(403).send({ error: "Forbidden: SuperAdmin only" });
      }

      const { provider } = request.params;
      if (!isValidProvider(provider)) {
        return reply
          .status(400)
          .send({ error: `Provider inválido. Use: ${VALID_PROVIDERS.join(", ")}` });
      }

      const body = request.body as { status?: "active" | "inactive" };
      if (!body?.status || (body.status !== "active" && body.status !== "inactive")) {
        return reply.status(400).send({ error: "Status inválido. Use 'active' ou 'inactive'." });
      }

      await credentialsService["repo"].setStatus(provider, body.status);

      return reply.send({
        success: true,
        provider,
        status: body.status,
        message: `Status de "${provider}" alterado para "${body.status}".`,
      });
    },
  );

  // ── DELETE /api/v1/admin/credentials/:provider ──
  app.delete(
    "/api/v1/admin/credentials/:provider",
    async (
      request: FastifyRequest<{ Params: { provider: string } }>,
      reply: FastifyReply,
    ) => {
      if (!request.user?.isSuperadmin) {
        return reply.status(403).send({ error: "Forbidden: SuperAdmin only" });
      }

      const { provider } = request.params;
      if (!isValidProvider(provider)) {
        return reply
          .status(400)
          .send({ error: `Provider inválido. Use: ${VALID_PROVIDERS.join(", ")}` });
      }

      await credentialsService["repo"].delete(provider);

      return reply.send({
        success: true,
        message: `Credenciais de "${provider}" removidas com sucesso.`,
      });
    },
  );
}
