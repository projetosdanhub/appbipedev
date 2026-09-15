import {
  type CreateCrmSegment,
  type UpdateCrmSegment,
  createCrmSegmentSchema,
  updateCrmSegmentSchema,
  type SegmentFilterAst,
  segmentFilterAstSchema,
} from "@bipesend/contracts";

export class SegmentEntity {
  static validateCreate(data: unknown): CreateCrmSegment {
    return createCrmSegmentSchema.parse(data);
  }

  static validateUpdate(data: unknown): UpdateCrmSegment {
    return updateCrmSegmentSchema.parse(data);
  }

  static validateFilterAst(data: unknown): SegmentFilterAst {
    return segmentFilterAstSchema.parse(data);
  }
}
