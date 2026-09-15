import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DealService } from "../application/deal.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCrmDealSchema, updateCrmDealSchema, moveCrmDealSchema } from "@bipesend/contracts";

export function dealRoutes(
  fastify: FastifyInstance,
  db: Database,
  dealService: DealService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/deals",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        const deals = await dealService.listDeals(request.tenantContext);
        return reply.status(200).send({ data: deals });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId/deals",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { pipelineId: string };
      try {
        const deals = await dealService.listDeals(request.tenantContext, params.pipelineId);
        return reply.status(200).send({ data: deals });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/deals",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCrmDealSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        const deal = await dealService.createDeal(request.tenantContext, parsed.data);
        return reply.status(201).send({ data: deal });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/deals/:dealId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { dealId: string };
      try {
        const deal = await dealService.getDeal(request.tenantContext, params.dealId);
        return reply.status(200).send({ data: deal });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Deal not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/api/v1/tenants/:tenantId/deals/:dealId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCrmDealSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { dealId: string };
      const body = request.body as any;
      if (typeof body.version !== "number") {
        return reply.status(400).send({ error: "Optimistic locking version required" });
      }

      try {
        const deal = await dealService.updateDeal(request.tenantContext, params.dealId, body.version, parsed.data);
        return reply.status(200).send({ data: deal });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Deal not found" });
        if (e.message === "CONCURRENCY_CONFLICT") return reply.status(409).send({ error: "Deal was updated by another user" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/deals/:dealId/move",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = moveCrmDealSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { dealId: string };
      try {
        const deal = await dealService.moveDeal(request.tenantContext, params.dealId, parsed.data);
        return reply.status(200).send({ data: deal });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Deal not found" });
        if (e.message === "CONCURRENCY_CONFLICT") return reply.status(409).send({ error: "Deal was updated by another user" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
