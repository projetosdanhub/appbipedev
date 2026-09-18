import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert";
import { ContactImportService } from "../modules/05-crm/application/contact-import.service";

describe("ContactImportService", () => {
  let importRepo: any;
  let contactService: any;
  let service: ContactImportService;
  let createdContacts: any[] = [];

  beforeEach(() => {
    createdContacts = [];
    importRepo = {
      create: (tenantId: string, input: any) => Promise.resolve({ id: "batch-1", status: "preview_ready", ...input, tenantId }),
      findById: (tenantId: string, _id: string) => Promise.resolve({
        id: "batch-1",
        tenantId,
        status: "preview_ready",
        stagedRows: [
          { name: "John Doe", email: "john@doe.com" },
          { name: "Jane Doe", email: "jane@doe.com", customFields: { age: 25 } }
        ],
        rowIssues: []
      }),
      updateStatus: () => Promise.resolve(true),
    };
    
    contactService = {
      createContact: async (_id: string, contactPayload: any) => {
        createdContacts.push(contactPayload);
        return { id: "c-1" };
      }
    };
    
    service = new ContactImportService(importRepo as any, contactService as any);
  });

  it("should commit an import batch and call contactService.createContact", async () => {
    const validContext: any = {
      tenantId: "123e4567-e89b-12d3-a456-426614174000",
      userId: "123e4567-e89b-12d3-a456-426614174001",
      membershipId: "123e4567-e89b-12d3-a456-426614174002",
      requestId: "req-1",
      role: "tenant_admin" as const,
      globalPermissions: ["crm.contacts.create"],
      departmentGrants: {}
    };

    const batch = await service.commit(validContext, "batch-1", { confirmationKey: "confirm" } as any);
    
    assert.strictEqual(batch.id, "batch-1");
    assert.strictEqual(createdContacts.length, 2);
    assert.deepStrictEqual(createdContacts[0], {
      name: "John Doe", email: "john@doe.com", phone: null, source: "csv_import", customFields: {}
    });
    assert.deepStrictEqual(createdContacts[1], {
      name: "Jane Doe", email: "jane@doe.com", phone: null, source: "csv_import", customFields: { age: 25 }
    });
  });
});
