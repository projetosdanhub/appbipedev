import { Database } from "../../00-shared/infrastructure/database.js";
import { PipelineRepository } from "../infrastructure/pipeline.repository.js";
import { type CreateCrmPipeline, type UpdateCrmPipeline, type CreateCrmPipelineStage, type UpdateCrmPipelineStage } from "@bipesend/contracts";
import { assertPermission } from "@bipesend/auth/policies";
import type { TenantContext } from "@bipesend/contracts";
import { PipelineEntity, PipelineStageEntity } from "../domain/pipeline.entity.js";

export class PipelineService {
  constructor(
    private readonly db: Database,
    private readonly pipelineRepository: PipelineRepository
  ) {}

  async createPipeline(context: TenantContext, input: CreateCrmPipeline) {
    assertPermission(context, "crm.pipelines.manage");
    const validated = PipelineEntity.validateCreate(input);
    return this.pipelineRepository.createPipeline(context.tenantId, validated);
  }

  async listPipelines(context: TenantContext) {
    assertPermission(context, "crm.deals.read");
    return this.pipelineRepository.listPipelines(context.tenantId);
  }

  async getPipeline(context: TenantContext, pipelineId: string) {
    assertPermission(context, "crm.deals.read");
    const pipeline = await this.pipelineRepository.getPipeline(context.tenantId, pipelineId);
    if (!pipeline) {
      throw new Error("NOT_FOUND");
    }
    return pipeline;
  }

  async updatePipeline(context: TenantContext, pipelineId: string, input: UpdateCrmPipeline) {
    assertPermission(context, "crm.pipelines.manage");
    const validated = PipelineEntity.validateUpdate(input);
    return this.pipelineRepository.updatePipeline(context.tenantId, pipelineId, validated);
  }

  async listStages(context: TenantContext, pipelineId: string) {
    assertPermission(context, "crm.deals.read");
    return this.pipelineRepository.listStages(context.tenantId, pipelineId);
  }

  async createStage(context: TenantContext, pipelineId: string, input: CreateCrmPipelineStage) {
    assertPermission(context, "crm.pipelines.manage");
    const validated = PipelineStageEntity.validateCreate({ ...input, pipelineId });
    return this.pipelineRepository.createStage(context.tenantId, pipelineId, validated);
  }

  async updateStage(context: TenantContext, stageId: string, input: UpdateCrmPipelineStage) {
    assertPermission(context, "crm.pipelines.manage");
    const validated = PipelineStageEntity.validateUpdate(input);
    return this.pipelineRepository.updateStage(context.tenantId, stageId, validated);
  }

  async deletePipeline(context: TenantContext, pipelineId: string) {
    assertPermission(context, "crm.pipelines.manage");
    return this.pipelineRepository.deletePipeline(context.tenantId, pipelineId);
  }

  async deleteStage(context: TenantContext, stageId: string, transferToStageId?: string) {
    assertPermission(context, "crm.pipelines.manage");
    return this.pipelineRepository.deleteStage(context.tenantId, stageId, transferToStageId);
  }
}
