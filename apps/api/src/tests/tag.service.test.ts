import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert";
import { TagService } from "../modules/05-crm/application/tag.service";
import { Database } from "../modules/00-shared/infrastructure/database";

describe("TagService", () => {
  let db: Database;
  let tagRepo: any;
  let service: TagService;

  const validContext: any = {
    tenantId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    membershipId: "123e4567-e89b-12d3-a456-426614174002",
    requestId: "req-1",
    role: "tenant_admin" as const,
    globalPermissions: ["crm.tags.manage", "crm.tags.read", "crm.tags.assign"],
    departmentGrants: {}
  };

  beforeEach(() => {
    db = {
      query: async (text: string, params: any[]) => {
        if (text.includes("name_normalized = $2") && params[1] === "duplicate") {
          return [{ id: "tag-2" }];
        }
        return [];
      }
    } as any;
    
    tagRepo = {
      create: (tenantId: string, input: any) => Promise.resolve({ id: "tag-1", ...input, tenantId }),
      findMany: () => Promise.resolve({ data: [], total: 0 }),
      findById: (tenantId: string, id: string) => Promise.resolve(id === "tag-1" ? { id: "tag-1" } : null),
      update: (tenantId: string, id: string, input: any) => Promise.resolve({ id, ...input, tenantId }),
      delete: () => Promise.resolve(true),
      assignToContact: () => Promise.resolve(),
      removeFromContact: () => Promise.resolve(),
    };
    
    service = new TagService(tagRepo as any, db);
  });

  it("should create a tag successfully", async () => {
    const input = {
      name: "VIP",
      colorToken: "bg-blue-100 text-blue-800",
      status: "active"
    };

    const result = await service.createTag(validContext, input);
    assert.strictEqual(result.id, "tag-1");
    assert.strictEqual(result.name, "VIP");
    assert.strictEqual(result.colorToken, "bg-blue-100 text-blue-800");
    assert.strictEqual(result.tenantId, validContext.tenantId);
  });

  it("should fail if tag name already exists", async () => {
    const input = {
      name: "Duplicate",
      colorToken: "bg-blue-100 text-blue-800",
      status: "active"
    };

    await assert.rejects(
      async () => service.createTag(validContext, input),
      { message: "Tag with this name already exists" }
    );
  });

  it("should fail to create tag if permission is missing", async () => {
    const context = { ...validContext, globalPermissions: [] };

    await assert.rejects(
      async () => service.createTag(context, { name: "VIP", colorToken: "bg-blue-100 text-blue-800", status: "active" }),
      { message: "PERMISSION_DENIED" }
    );
  });

  it("should update a tag successfully", async () => {
    const input = {
      name: "Super VIP"
    };

    const result = await service.updateTag(validContext, "tag-1", input);
    assert.strictEqual(result.id, "tag-1");
    assert.strictEqual(result.name, "Super VIP");
  });

  it("should assign tag to contact", async () => {
    // Should pass without throwing
    await service.assignTagToContact(validContext, "contact-1", "tag-1");
  });

  it("should throw when assigning non-existent tag", async () => {
    await assert.rejects(
      async () => service.assignTagToContact(validContext, "contact-1", "tag-999"),
      { message: "Tag not found" }
    );
  });
});
