import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { TeamService } from "../application/team.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { tenantRoleSchema } from "@bipesend/contracts";

export function teamRoutes(
  fastify: FastifyInstance,
  db: Database,
  teamService: TeamService
) {
  fastify.get(
    "/tenants/:tenantId/team/members",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        const members = await teamService.listMembers(request.tenantContext);
        return reply.status(200).send({ members });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/tenants/:tenantId/team/members/:membershipId/role",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as any;
      const parsed = tenantRoleSchema.safeParse(body?.role);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid role" });
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });

      const params = request.params as { membershipId: string };
      try {
        await teamService.updateRole(request.tenantContext, params.membershipId, parsed.data);
        return reply.status(200).send({ ok: true });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/tenants/:tenantId/team/invites",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as any;
      if (!body?.email || !body?.role) return reply.status(400).send({ error: "Email and role are required" });
      const parsedRole = tenantRoleSchema.safeParse(body.role);
      if (!parsedRole.success) return reply.status(400).send({ error: "Invalid role" });
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });

      try {
        const { tokenHash } = await teamService.inviteMember(request.tenantContext, body.email, parsedRole.data);
        return reply.status(200).send({ ok: true, tokenHash });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/tenants/:tenantId/team/members/:membershipId/suspend",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });

      const params = request.params as { membershipId: string };
      const body = request.body as { transferToMembershipId?: string } | undefined;
      try {
        await teamService.suspendMember(request.tenantContext, params.membershipId, body?.transferToMembershipId);
        return reply.status(200).send({ ok: true });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/tenants/:tenantId/team/members/:membershipId/reactivate",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });

      const params = request.params as { membershipId: string };
      try {
        await teamService.reactivateMember(request.tenantContext, params.membershipId);
        return reply.status(200).send({ ok: true });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
