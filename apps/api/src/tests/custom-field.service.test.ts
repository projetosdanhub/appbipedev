import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert";
import { CustomFieldService } from "../modules/05-crm/application/custom-field.service";

describe("CustomFieldService", () => {
  let customFieldRepo: any;
  let service: CustomFieldService;

  beforeEach(() => {
    customFieldRepo = {
      create: (tenantId: string, input: any) => Promise.resolve({ id: "cf-1", ...input, tenantId }),
      list: () => Promise.resolve([]),
      findById: () => Promise.resolve(null),
      update: () => Promise.resolve(null),
      delete: () => Promise.resolve(true),
    };
    
    service = new CustomFieldService(customFieldRepo as any);
  });

  const validContext: any = {
    tenantId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    membershipId: "123e4567-e89b-12d3-a456-426614174002",
    requestId: "req-1",
    role: "tenant_admin" as const,
    globalPermissions: ["crm.custom_fields.manage"],
    departmentGrants: {}
  };

  it("should create a custom field", async () => {
    const input = {
      name: "Age",
      key: "age",
      type: "number" as const,
      entityType: "contact" as const,
      status: "active" as const,
      label: "Age",
      options: null,
    };

    const result = await service.create(validContext, input);
    assert.strictEqual(result.id, "cf-1");
    assert.strictEqual(result.key, "age");
    assert.strictEqual(result.tenantId, validContext.tenantId);
  });
});
