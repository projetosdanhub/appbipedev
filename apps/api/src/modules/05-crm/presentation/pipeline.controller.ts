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

  fastify.delete(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });

      const params = request.params as { pipelineId: string };
      try {
        await pipelineService.deletePipeline(request.tenantContext, params.pipelineId);
        return reply.status(200).send({ success: true });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Pipeline not found" });
        if (e.message === "CANNOT_DELETE_PIPELINE_WITH_DEALS") {
          return reply.status(400).send({ error: "Não é possível excluir pipeline com negócios vinculados." });
        }
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  // Stages
  fastify.get(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId/stages",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { pipelineId: string };
      try {
        const stages = await pipelineService.listStages(request.tenantContext, params.pipelineId);
        return reply.status(200).send({ data: stages });
      } catch (e: any) {
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );

  fastify.post(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId/stages",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { pipelineId: string };
      const body = typeof request.body === "object" && request.body !== null ? request.body : {};
      const parsed = createCrmPipelineStageSchema.safeParse({
        ...body,
        pipelineId: (body as any).pipelineId || params.pipelineId,
      });
      if (!parsed.success) return reply.status(400).send({ error: "Invalid data", details: parsed.error.issues });
      
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

  fastify.delete(
    "/api/v1/tenants/:tenantId/pipelines/:pipelineId/stages/:stageId",
    { preHandler: createTenantMiddleware(db) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.tenantContext) return reply.status(403).send({ error: "Tenant access denied" });
      
      const params = request.params as { stageId: string };
      try {
        await pipelineService.deleteStage(request.tenantContext, params.stageId);
        return reply.status(200).send({ success: true });
      } catch (e: any) {
        if (e.message === "NOT_FOUND") return reply.status(404).send({ error: "Stage not found" });
        if (e.message === "CANNOT_DELETE_STAGE_WITH_DEALS") {
          return reply.status(400).send({ error: "Não é possível excluir etapa com negócios vinculados." });
        }
        return reply.status(403).send({ error: e.message || "Operation failed" });
      }
    }
  );
}

