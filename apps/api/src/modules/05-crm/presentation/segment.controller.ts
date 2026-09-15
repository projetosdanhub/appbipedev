import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SegmentService } from "../application/segment.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCrmSegmentSchema, updateCrmSegmentSchema } from "@bipesend/contracts";

export function segmentRoutes(
  fastify: FastifyInstance,
  db: Database,
  segmentService: SegmentService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/segments",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        const query = request.query as { limit?: string, offset?: string };
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        const offset = query.offset ? parseInt(query.offset, 10) : 0;
        
        const segments = await segmentService.getSegments(request.tenantContext, { limit, offset });
        return reply.status(200).send({ data: segments.data, total: segments.total });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/segments",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCrmSegmentSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        const segment = await segmentService.createSegment(request.tenantContext, parsed.data);
        return reply.status(201).send({ data: segment });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/segments/:segmentId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { segmentId: string };
      try {
        const segment = await segmentService.getSegment(request.tenantContext, params.segmentId);
        if (!segment) return reply.status(404).send({ error: "Segment not found" });
        return reply.status(200).send({ data: segment });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.patch(
    "/api/v1/tenants/:tenantId/segments/:segmentId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCrmSegmentSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { segmentId: string };
      try {
        const segment = await segmentService.updateSegment(request.tenantContext, params.segmentId, parsed.data);
        return reply.status(200).send({ data: segment });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.delete(
    "/api/v1/tenants/:tenantId/segments/:segmentId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { segmentId: string };
      try {
        await segmentService.deleteSegment(request.tenantContext, params.segmentId);
        return reply.status(204).send();
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/segments/preview",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      try {
        const result = await segmentService.previewSegment(request.tenantContext, request.body);
        return reply.status(200).send({ data: result });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
