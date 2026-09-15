import { CustomField, CreateCustomField, UpdateCustomField } from "@bipesend/contracts";
import { CustomFieldRepository } from "../infrastructure/custom-field.repository";

export class CustomFieldService {
  constructor(private readonly repository: CustomFieldRepository) {}

  async list(tenantId: string, entityType: string): Promise<CustomField[]> {
    return this.repository.list(tenantId, entityType);
  }

  async create(tenantId: string, data: Omit<CreateCustomField, "tenantId">): Promise<CustomField> {
    return this.repository.create(tenantId, {
      ...data,
      tenantId,
    } as any);
  }

  async update(tenantId: string, id: string, data: UpdateCustomField): Promise<CustomField> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    return this.repository.update(tenantId, id, data);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    await this.repository.delete(tenantId, id);
  }
}
