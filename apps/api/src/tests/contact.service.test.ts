import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert";
import { ContactService } from "../modules/05-crm/application/contact.service";
import { Database } from "../modules/00-shared/infrastructure/database";

describe("ContactService", () => {
  let db: Database;
  let contactRepo: any;
  let customFieldRepo: any;
  let service: ContactService;

  beforeEach(() => {
    db = {} as Database;
    contactRepo = {
      create: (tenantId: string, input: any) => Promise.resolve({ id: "contact-1", ...input, tenantId }),
      list: () => Promise.resolve([]),
      findById: () => Promise.resolve(null),
      update: () => Promise.resolve(null),
      delete: () => Promise.resolve(true),
    };
    customFieldRepo = {
      list: () => Promise.resolve([
        { key: "age", type: "number", status: "active" },
        { key: "vip", type: "boolean", status: "active" }
      ]),
    };
    
    service = new ContactService(db, contactRepo as any, customFieldRepo as any);
  });

  const validContext: any = {
    tenantId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    membershipId: "123e4567-e89b-12d3-a456-426614174002",
    requestId: "req-1",
    role: "tenant_admin" as const,
    globalPermissions: ["crm.contacts.create"],
    departmentGrants: {}
  };

  it("should create a contact successfully", async () => {
    const input = {
      name: "John Doe",
      email: "john@doe.com",
    };

    const result = await service.createContact(validContext, input);
    assert.strictEqual(result.id, "contact-1");
    assert.strictEqual(result.name, "John Doe");
    assert.strictEqual(result.tenantId, validContext.tenantId);
  });

  it("should fail if permission is missing", async () => {
    const context = { ...validContext, globalPermissions: [] };

    await assert.rejects(
      async () => service.createContact(context, { name: "Test" }),
      { message: "PERMISSION_DENIED" }
    );
  });

  it("should validate custom fields successfully", async () => {
    const input = {
      name: "Jane",
      customFields: {
        age: 30,
        vip: true
      }
    };

    const result = await service.createContact(validContext, input);
    assert.deepStrictEqual(result.customFields, { age: 30, vip: true });
  });

  it("should throw error if custom field type is invalid", async () => {
    const input = {
      name: "Jane",
      customFields: {
        age: "thirty", // Should be number
      }
    };

    await assert.rejects(
      async () => service.createContact(validContext, input),
      /must be a number/
    );
  });
});
