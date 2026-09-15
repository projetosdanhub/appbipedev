import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PipelineService } from "../application/pipeline.service.js";
import { createTenantMiddleware } from "../../00-shared/presentation/auth.middleware.js";
import { Database } from "../../00-shared/infrastructure/database.js";
import { createCrmPipelineSchema, updateCrmPipelineSchema, createCrmPipelineStageSchema, updateCrmPipelineStageSchema } from "@bipesend/contracts";

export function pipelineRoutes(
  fastify: FastifyInstance,
  db: Database,
  pipelineService: PipelineService
) {
  fastify.get(
    "/api/v1/tenants/:tenantId/pipelines",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      try {
        const pipelines = await pipelineService.listPipelines(request.tenantContext);
        return reply.status(200).send({ data: pipelines });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/pipelines",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCrmPipelineSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      try {
        const pipeline = await pipelineService.createPipeline(request.tenantContext, parsed.data);
        return reply.status(201).send({ data: pipeline });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.get(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { pipelineId: string };
      try {
        const pipeline = await pipelineService.getPipeline(request.tenantContext, params.pipelineId);
        return reply.status(200).send({ data: pipeline });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Pipeline not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );


  fastify.put(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCrmPipelineSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { pipelineId: string };
      try {
        const pipeline = await pipelineService.updatePipeline(request.tenantContext, params.pipelineId, parsed.data);
        return reply.status(200).send({ data: pipeline });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Pipeline not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  // Stages
  fastify.post(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId/stages",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = createCrmPipelineStageSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { pipelineId: string };
      try {
        const stage = await pipelineService.createStage(request.tenantContext, params.pipelineId, parsed.data);
        return reply.status(201).send({ data: stage });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.put(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId/stages/:stageId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const parsed = updateCrmPipelineStageSchema.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
      const params = request.params as { stageId: string };
      try {
        const stage = await pipelineService.updateStage(request.tenantContext, params.stageId, parsed.data);
        return reply.status(200).send({ data: stage });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Stage not found" });
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}
