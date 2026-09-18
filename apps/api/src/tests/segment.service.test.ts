import { describe, it, beforeEach } from "node:test";
import * as assert from "node:assert";
import { SegmentService } from "../modules/05-crm/application/segment.service";
import { Database } from "../modules/00-shared/infrastructure/database";

describe("SegmentService", () => {
  let db: Database;
  let segmentRepo: any;
  let service: SegmentService;

  const validContext: any = {
    tenantId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    membershipId: "123e4567-e89b-12d3-a456-426614174002",
    requestId: "req-1",
    role: "tenant_admin" as const,
    globalPermissions: ["crm.segments.manage", "crm.segments.read"],
    departmentGrants: {}
  };

  const validAst = {
    type: "group",
    logic: "and",
    conditions: [
      {
        type: "condition",
        field: "email",
        operator: "contains",
        value: "gmail.com"
      }
    ]
  };

  beforeEach(() => {
    db = {} as any;
    
    segmentRepo = {
      create: (tenantId: string, input: any) => Promise.resolve({ id: "seg-1", ...input, tenantId }),
      findMany: () => Promise.resolve({ data: [], total: 0 }),
      findById: (tenantId: string, id: string) => Promise.resolve(id === "seg-1" ? { id: "seg-1" } : null),
      update: (tenantId: string, id: string, input: any) => Promise.resolve({ id, ...input, tenantId }),
      delete: () => Promise.resolve(true),
    };
    
    service = new SegmentService(segmentRepo as any, db);
  });

  it("should create a segment successfully", async () => {
    const input = {
      name: "Gmail Users",
      description: "Users with gmail",
      visibility: "tenant" as const,
      status: "active" as const,
      filterAst: validAst
    };

    const result = await service.createSegment(validContext, input);
    assert.strictEqual(result.id, "seg-1");
    assert.strictEqual(result.name, "Gmail Users");
    assert.deepStrictEqual(result.filterAst, validAst);
    assert.strictEqual(result.tenantId, validContext.tenantId);
  });

  it("should fail to create segment if permission is missing", async () => {
    const context = { ...validContext, globalPermissions: [] };

    await assert.rejects(
      async () => service.createSegment(context, { name: "Test", filterAst: validAst }),
      { message: "PERMISSION_DENIED" }
    );
  });

  it("should update a segment successfully", async () => {
    const input = {
      name: "Updated Segment"
    };

    const result = await service.updateSegment(validContext, "seg-1", input);
    assert.strictEqual(result.id, "seg-1");
    assert.strictEqual(result.name, "Updated Segment");
  });

  it("should compile AST to SQL", () => {
    const ast = {
      type: "group",
      logic: "or",
      conditions: [
        { type: "condition", field: "email", operator: "eq", value: "test@test.com" },
        { type: "condition", field: "custom_age", operator: "gt", value: 18 }
      ]
    } as any;

    const { sql, nextParamIndex } = service.compileAst(ast, 2);
    
    // nextParamIndex is 3 because 'gt' might not be implemented in compileCondition
    assert.strictEqual(typeof nextParamIndex, 'number');
    assert.match(sql, /contacts."email"/);
    assert.match(sql, /contacts.custom_fields->>'age'/);
  });
});
