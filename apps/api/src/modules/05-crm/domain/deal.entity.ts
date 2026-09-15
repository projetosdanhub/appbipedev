import {
  type CreateCrmDeal,
  type UpdateCrmDeal,
  type MoveCrmDeal,
  createCrmDealSchema,
  updateCrmDealSchema,
  moveCrmDealSchema,
} from "@bipesend/contracts";

export class DealEntity {
  id!: string;
  tenantId!: string;
  pipelineId!: string;
  stageId!: string;
  contactId!: string | null;
  title!: string;
  amount!: string | null;
  currency!: string;
  expectedCloseDate!: Date | null;
  closedAt!: Date | null;
  lostReason!: string | null;
  departmentId!: string | null;
  routingRoleId!: string | null;
  assignedMembershipId!: string | null;
  createdByMembershipId!: string;
  updatedByMembershipId!: string | null;
  version!: number;
  archivedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static validateCreate(data: unknown): CreateCrmDeal {
    return createCrmDealSchema.parse(data);
  }

  static validateUpdate(data: unknown): UpdateCrmDeal {
    return updateCrmDealSchema.parse(data);
  }

  static validateMove(data: unknown): MoveCrmDeal {
    return moveCrmDealSchema.parse(data);
  }
}
