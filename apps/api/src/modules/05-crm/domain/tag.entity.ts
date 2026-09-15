import {
  type CreateCrmTag,
  type UpdateCrmTag,
  createCrmTagSchema,
  updateCrmTagSchema,
  type CreateCrmContactTag,
  createCrmContactTagSchema,
} from "@bipesend/contracts";

export class TagEntity {
  static validateCreate(data: unknown): CreateCrmTag {
    return createCrmTagSchema.parse(data);
  }

  static validateUpdate(data: unknown): UpdateCrmTag {
    return updateCrmTagSchema.parse(data);
  }
}

export class ContactTagEntity {
  static validateCreate(data: unknown): CreateCrmContactTag {
    return createCrmContactTagSchema.parse(data);
  }
}
