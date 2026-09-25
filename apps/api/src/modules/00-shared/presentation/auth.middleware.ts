import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyWebhook, verifyApiKey, verifyInternalToken } from "@bipesend/security";
import { idSchema, type TenantContext } from "@bipesend/contracts";
import { resolveTenantContext } from "@bipesend/auth/policies";
import { Database } from "../infrastructure/database.js";
import { SessionRepository } from "../../01-identity/infrastructure/session.repository.js";
import { UserRepository } from "../../01-identity/infrastructure/user.repository.js";
import type { User } from "../../01-identity/domain/user.entity.js";
import { verifySession } from "@bipesend/auth/session";
import { decode } from "@auth/core/jwt";

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
    const secure = process.env.NODE_ENV === "production";
    const cookieName = `${secure ? "__Secure-" : ""}bipesend.tenant.session-token`;
    const token = request.cookies[cookieName];
    if (!token) return reply.status(401).send({ error: "Unauthorized" });
    
    let decoded;
    try {
      decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET as string,
        salt: cookieName,
      });
    } catch {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    if (!decoded || !decoded.sessionId || decoded.surface !== "tenant") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const isValid = await verifySession(decoded.sessionId as string, "tenant");
    if (!isValid) return reply.status(401).send({ error: "Unauthorized" });
    
    const user = await users.findById(decoded.id as string);
    if (!user) return reply.status(401).send({ error: "Unauthorized" });
    request.user = user;
  };
}

export function createSuperAdminAuthMiddleware(
  users: UserRepository,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // 1. Chave interna de serviço para server actions do SuperAdmin
    const internalKey = request.headers["x-internal-api-key"] || (
      request.headers["authorization"]?.startsWith("Bearer ")
        ? request.headers["authorization"].split(" ")[1]
        : null
    );
    if (internalKey && process.env.INTERNAL_API_KEY && internalKey === process.env.INTERNAL_API_KEY) {
      request.user = {
        id: "superadmin-internal",
        email: "internal@bipesend.com.br",
        name: "SuperAdmin Internal",
        isSuperadmin: true,
      } as any;
      return;
    }

    // 2. Cookie de sessão da plataforma SuperAdmin (surface: "platform")
    const secure = process.env.NODE_ENV === "production";
    const cookieName = `${secure ? "__Secure-" : ""}bipesend.platform.session-token`;
    const token = request.cookies[cookieName];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized: SuperAdmin session missing" });
    }

    let decoded;
    try {
      decoded = await decode({
        token,
        secret: (process.env.SUPERADMIN_AUTH_SECRET || process.env.AUTH_SECRET) as string,
        salt: cookieName,
      });
    } catch {
      return reply.status(401).send({ error: "Unauthorized: Invalid platform token" });
    }

    if (!decoded || !decoded.sessionId || decoded.surface !== "platform") {
      return reply.status(401).send({ error: "Unauthorized: Invalid surface" });
    }

    const isValid = await verifySession(decoded.sessionId as string, "platform");
    if (!isValid) return reply.status(401).send({ error: "Unauthorized: Invalid session" });

    const user = await users.findById(decoded.id as string);
    if (!user || !user.isSuperadmin) {
      return reply.status(403).send({ error: "Forbidden: SuperAdmin required" });
    }
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
                  'SELECT id, user_id AS "userId", tenant_id AS "tenantId", role, active FROM memberships WHERE user_id = $1 AND tenant_id = $2',
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
/** Internal service-to-service authentication using symmetric JWT. */
export function createInternalJwtMiddleware(
  expectedKey = process.env.INTERNAL_API_KEY ?? "",
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1]!;
    try {
      await verifyInternalToken(token, expectedKey);
    } catch {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  };
}

/** External API key authentication for Tenants. */
export function createExternalApiKeyMiddleware(db: Database) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    
    const key = authHeader.split(" ")[1]!;
    
    // Prefix lookup to prevent unnecessary hashing
    const prefix = key.split("_").slice(0, 2).join("_");
    if (!prefix || key.split("_").length < 3) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    try {
      // Find keys with matching prefix in DB
      const keys = await db.query<{
        id: string;
        tenantId: string;
        keyHash: string;
        scopes: string[];
      }>(
        'SELECT id, tenant_id as "tenantId", key_hash as "keyHash", scopes FROM api_keys WHERE prefix = $1 AND (revoked_at IS NULL OR revoked_at > NOW()) AND (expires_at IS NULL OR expires_at > NOW())',
        [prefix]
      );
      
      let matchedKey = null;
      for (const row of keys) {
        if (verifyApiKey(key, row.keyHash)) {
          matchedKey = row;
          break;
        }
      }

      if (!matchedKey) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      // Inject the context for the API routes
      request.tenantId = matchedKey.tenantId;
      // You could inject scopes here too if needed
    } catch (_e) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
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
