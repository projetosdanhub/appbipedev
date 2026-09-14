import type { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import { constantTimeEqual, verifyWebhook } from "@bipesend/security";
import { idSchema, type TenantContext } from "@bipesend/contracts";
import { resolveTenantContext } from "@bipesend/auth/policies";
import { Database } from "../infrastructure/database.js";
import { SessionRepository } from "../../01-identity/infrastructure/session.repository.js";
import { UserRepository } from "../../01-identity/infrastructure/user.repository.js";
import type { User } from "../../01-identity/domain/user.entity.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
    tenantId?: string;
    tenantContext?: TenantContext;
    rawBody?: Buffer;
  }
}
export function createAuthMiddleware(
  sessions: SessionRepository,
  users: UserRepository,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies.session_token;
    if (!token) return reply.status(401).send({ error: "Unauthorized" });
    const session = await sessions.findByTokenHash(
      crypto.createHash("sha256").update(token).digest("hex"),
    );
    if (!session) return reply.status(401).send({ error: "Unauthorized" });
    const user = await users.findById(session.user_id);
    if (!user || user.isSuperadmin)
      return reply.status(401).send({ error: "Unauthorized" });
    request.user = user;
  };
}
export function createTenantMiddleware(db: Database) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) return reply.status(401).send({ error: "Unauthorized" });
    const params = request.params as { tenantId?: string };
    const selector = params?.tenantId ?? request.headers["x-tenant-id"];
    const parsed = idSchema.safeParse(selector);
    if (!parsed.success)
      return reply.status(400).send({ error: "Invalid tenant selector" });
    try {
      request.tenantContext = await db.withTransaction(
        async (tx) =>
          resolveTenantContext(
            {
              async findMembership(userId, tenantId) {
                const rows = await tx.query<{
                  id: string;
                  userId: string;
                  tenantId: string;
                  role: string;
                  active: boolean;
                }>(
                  'SELECT id, user_id AS "userId", tenant_id AS "tenantId", role, true AS active FROM memberships WHERE user_id = $1 AND tenant_id = $2',
                  [userId, tenantId],
                );
                return rows[0] ?? null;
              },
            },
            {
              userId: request.user!.id,
              tenantId: parsed.data,
              requestId: request.id,
            },
          ),
        parsed.data,
      );
      request.tenantId = parsed.data;
    } catch {
      return reply.status(403).send({ error: "Tenant access denied" });
    }
  };
}
/** Internal credential only. This does not implement public tenant API keys. */
export function createApiKeyMiddleware(
  expectedKey = process.env.INTERNAL_API_KEY ?? "",
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const supplied = request.headers["x-api-key"];
    if (
      expectedKey.length < 32 ||
      typeof supplied !== "string" ||
      !constantTimeEqual(supplied, expectedKey)
    )
      return reply.status(401).send({ error: "Unauthorized" });
  };
}
/** Generic internal protocol: timestamp.rawBody. Provider adapters must verify their own format. */
export function createWebhookHmacMiddleware(secret: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers["x-webhook-signature"],
      timestamp = request.headers["x-webhook-timestamp"];
    if (
      !request.rawBody ||
      typeof signature !== "string" ||
      typeof timestamp !== "string" ||
      !verifyWebhook({ rawBody: request.rawBody, signature, timestamp, secret })
    )
      return reply.status(401).send({ error: "Invalid webhook signature" });
    // Signature is not replay deduplication; consumer MUST persist provider event ID before effects.
  };
}
