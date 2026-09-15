import {
  type CreateCrmPipeline,
  type UpdateCrmPipeline,
  createCrmPipelineSchema,
  updateCrmPipelineSchema,
  type CreateCrmPipelineStage,
  type UpdateCrmPipelineStage,
  createCrmPipelineStageSchema,
  updateCrmPipelineStageSchema,
} from "@bipesend/contracts";

export class PipelineEntity {
  static validateCreate(data: unknown): CreateCrmPipeline {
    return createCrmPipelineSchema.parse(data);
  }

  static validateUpdate(data: unknown): UpdateCrmPipeline {
    return updateCrmPipelineSchema.parse(data);
  }
}

export class PipelineStageEntity {
  static validateCreate(data: unknown): CreateCrmPipelineStage {
    return createCrmPipelineStageSchema.parse(data);
  }

  static validateUpdate(data: unknown): UpdateCrmPipelineStage {
    return updateCrmPipelineStageSchema.parse(data);
  }
}
