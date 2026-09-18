import { CustomField, CreateCustomField, UpdateCustomField, TenantContext } from "@bipesend/contracts";
import { CustomFieldRepository } from "../infrastructure/custom-field.repository.js";

export class CustomFieldService {
  constructor(private readonly repository: CustomFieldRepository) {}

  async list(tenantId: string, entityType: string): Promise<CustomField[]> {
    return this.repository.list(tenantId, entityType);
  }

  async create(context: TenantContext, data: Omit<CreateCustomField, "tenantId">): Promise<CustomField> {
    return this.repository.create(context.tenantId, {
      ...data,
      tenantId: context.tenantId,
      createdByMembershipId: context.membershipId,
    } as any);
  }

  async update(context: TenantContext, id: string, data: UpdateCustomField): Promise<CustomField> {
    const existing = await this.repository.findById(context.tenantId, id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    return this.repository.update(context.tenantId, id, {
      ...data,
      updatedByMembershipId: context.membershipId
    });
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    await this.repository.delete(tenantId, id);
  }
}
