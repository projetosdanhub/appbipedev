import { tenantInvitationSchema } from "@bipesend/contracts";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { OnboardingService } from "../application/onboarding.service.js";
import { InvitationService } from "../application/invitation.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";

export function tenantRoutes(
  fastify: FastifyInstance,
  db: Database,
  onboardingService: OnboardingService,
  invitationService: InvitationService,
) {
  // We need to require authentication for these routes.
  // We will assume fastify hooks or a wrapping plugin applies auth.
  // We'll just define the routes. The top-level router should apply `createAuthMiddleware`.

  fastify.post(
    "/tenants",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { name } = request.body as any;
      if (!name) return reply.status(400).send({ error: "Missing name" });
      if (!request.user)
        return reply.status(401).send({ error: "Unauthorized" });

      try {
        const result = await onboardingService.createTenantForUser(
          request.user.id,
          name,
        );
        return reply.status(201).send({
          tenant: { id: result.tenant.id, name: result.tenant.name },
          membership: { role: result.membership.role },
        });
      } catch {
        return reply
          .status(400)
          .send({ error: "Operation could not be completed" });
      }
    },
  );

  fastify.post(
    "/tenants/:tenantId/invitations",
    { preHandler: createTenantMiddleware(db) },
    async (request, reply) => {
      const parsed = tenantInvitationSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.status(400).send({ error: "Invalid invitation" });
      if (!request.tenantContext)
        return reply.status(403).send({ error: "Tenant access denied" });
      try {
        await invitationService.invite(
          request.tenantContext,
          parsed.data.email,
          parsed.data.role,
        );
        return reply.status(201).send({ ok: true });
      } catch {
        return reply
          .status(403)
          .send({ error: "Invitation could not be created" });
      }
    },
  );

  fastify.post(
    "/invitations/accept",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { token } = request.body as any;
      if (!token) return reply.status(400).send({ error: "Missing token" });
      if (!request.user)
        return reply.status(401).send({ error: "Unauthorized" });

      try {
        // Capability lookup precedes tenant selection; the service owns the consuming transaction.
        await invitationService.accept(
          token,
          request.user.id,
          request.user.email,
        );
        return reply.status(200).send({ ok: true });
      } catch {
        return reply
          .status(400)
          .send({ error: "Operation could not be completed" });
      }
    },
  );
}
