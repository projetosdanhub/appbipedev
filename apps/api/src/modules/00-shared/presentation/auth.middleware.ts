import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import { Database } from "../infrastructure/database.js";
import { SessionRepository } from "../../01-identity/infrastructure/session.repository.js";
import { UserRepository } from "../../01-identity/infrastructure/user.repository.js";
import { env } from "../../../config/env.js";

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

    request.tenantId = tenantId;
  };
}

export function createApiKeyMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = request.headers["x-api-key"] as string;
    if (!apiKey) {
      return reply.status(401).send({ error: "Missing API key" });
    }
    // In a real application, validate the API key against the database here
    if (apiKey !== env.INTERNAL_API_KEY && !apiKey.startsWith("bipesend_")) {
      return reply.status(401).send({ error: "Invalid API key" });
    }
    // Set appropriate context
  };
}

export function createWebhookHmacMiddleware(webhookSecret: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers["x-webhook-signature"] as string;
    if (!signature) {
      return reply.status(401).send({ error: "Missing webhook signature" });
    }

    const payload = JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    // Prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return reply.status(401).send({ error: "Invalid webhook signature" });
    }
  };
}
