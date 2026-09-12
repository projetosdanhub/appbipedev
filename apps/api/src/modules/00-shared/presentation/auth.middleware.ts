import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import { Database } from "../infrastructure/database.js";
import { SessionRepository } from "../../01-identity/infrastructure/session.repository.js";
import { UserRepository } from "../../01-identity/infrastructure/user.repository.js";

// Add user to request
declare module "fastify" {
  interface FastifyRequest {
    user?: any;
    tenantId?: string;
  }
}

export function createAuthMiddleware(
  sessionRepository: SessionRepository,
  userRepository: UserRepository
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies.session_token;
    if (!sessionToken) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
    const session = await sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      return reply.status(401).send({ error: "Invalid session" });
    }

    const user = await userRepository.findById(session.user_id);
    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    request.user = user;
  };
}

export function createTenantMiddleware(db: Database) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Auth middleware should run first
    if (!request.user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Expect tenant_id in header or extract from URL?
    // According to best practices, usually header X-Tenant-ID or similar
    const tenantId = request.headers["x-tenant-id"] as string;
    
    if (!tenantId) {
      return reply.status(400).send({ error: "Missing x-tenant-id header" });
    }

    // To apply RLS, we must be inside a transaction where current_setting is set.
    // However, fastify doesn't natively wrap requests in pg transactions across async boundaries cleanly without cls-hooked or AsyncLocalStorage.
    // We can use AsyncLocalStorage to pass the tenantId and wrap the controller in a transaction, OR we just let the controller wrap it.
    // Let's store it in request, and controllers must wrap DB calls in `db.withTenant(tenantId, async () => { ... })`
    request.tenantId = tenantId;
  };
}
