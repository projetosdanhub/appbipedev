import { Database } from "../../00-shared/infrastructure/database.js";
import { type TenantContext, type CrmTag } from "@bipesend/contracts";
import { assertPermission } from "@bipesend/auth";
import { TagRepository } from "../infrastructure/tag.repository.js";
import { TagEntity } from "../domain/tag.entity.js";

export class TagService {
  constructor(
    private readonly tagRepo: TagRepository,
    private readonly db: Database
  ) {}

  async createTag(
    context: TenantContext,
    data: unknown
  ): Promise<CrmTag> {
    assertPermission(context, "crm.tags.manage");
    const validData = TagEntity.validateCreate(data);
    
    // Check if tag with same name already exists
    const existing = await this.db.query(
      `SELECT id FROM tags WHERE tenant_id = $1 AND name_normalized = $2`,
      [context.tenantId, validData.name.toLowerCase().trim()]
    );
    
    if (existing.length > 0) {
      throw new Error("Tag with this name already exists");
    }

    return this.tagRepo.create(context.tenantId, {
      ...validData,
      createdByMembershipId: context.membershipId
    });
  }

  async getTags(
    context: TenantContext,
    params: { limit?: number; offset?: number }
  ): Promise<{ data: CrmTag[]; total: number }> {
    assertPermission(context, "crm.tags.read");
    return this.tagRepo.findMany(context.tenantId, params);
  }

  async getTag(context: TenantContext, tagId: string): Promise<CrmTag | null> {
    assertPermission(context, "crm.tags.read");
    return this.tagRepo.findById(context.tenantId, tagId);
  }

  async updateTag(
    context: TenantContext,
    tagId: string,
    data: unknown
  ): Promise<CrmTag> {
    assertPermission(context, "crm.tags.manage");
    const validData = TagEntity.validateUpdate(data);
    
    if (validData.name) {
      const existing = await this.db.query(
        `SELECT id FROM tags WHERE tenant_id = $1 AND name_normalized = $2 AND id != $3`,
        [context.tenantId, validData.name.toLowerCase().trim(), tagId]
      );
      if (existing.length > 0) {
        throw new Error("Another tag with this name already exists");
      }
    }

    return this.tagRepo.update(context.tenantId, tagId, validData);
  }

  async deleteTag(context: TenantContext, tagId: string): Promise<void> {
    assertPermission(context, "crm.tags.manage");
    await this.tagRepo.delete(context.tenantId, tagId);
  }

  // --- Contact Tag Operations ---

  async assignTagToContact(
    context: TenantContext,
    contactId: string,
    tagId: string
  ): Promise<void> {
    assertPermission(context, "crm.tags.assign");
    
    // verify tag exists
    const tag = await this.getTag(context, tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }
    
    // verify contact exists (assume contact existence is checked or constraint will fail)
    await this.tagRepo.assignToContact(context.tenantId, contactId, tagId, context.membershipId);
  }

  async removeTagFromContact(
    context: TenantContext,
    contactId: string,
    tagId: string
  ): Promise<void> {
    assertPermission(context, "crm.tags.assign");
    await this.tagRepo.removeFromContact(context.tenantId, contactId, tagId);
  }
}
