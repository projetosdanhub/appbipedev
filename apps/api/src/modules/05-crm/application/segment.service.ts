import { Database } from "../../00-shared/infrastructure/database.js";
import { 
  type TenantContext, 
  type CrmSegment, 
  type SegmentFilterAst,
  type FilterCondition
} from "@bipesend/contracts";
import { assertPermission } from "@bipesend/auth";
import { SegmentRepository } from "../infrastructure/segment.repository.js";
import { SegmentEntity } from "../domain/segment.entity.js";

export class SegmentService {
  constructor(
    private readonly segmentRepo: SegmentRepository,
    private readonly db: Database
  ) {}

  async createSegment(
    context: TenantContext,
    data: unknown
  ): Promise<CrmSegment> {
    assertPermission(context, "crm.segments.manage");
    const validData = SegmentEntity.validateCreate(data);
    
    // validate AST
    SegmentEntity.validateFilterAst(validData.filterAst);

    return this.segmentRepo.create(context.tenantId, validData);
  }

  async getSegments(
    context: TenantContext,
    params: { limit?: number; offset?: number }
  ): Promise<{ data: CrmSegment[]; total: number }> {
    assertPermission(context, "crm.segments.read");
    return this.segmentRepo.findMany(context.tenantId, params);
  }

  async getSegment(context: TenantContext, segmentId: string): Promise<CrmSegment | null> {
    assertPermission(context, "crm.segments.read");
    return this.segmentRepo.findById(context.tenantId, segmentId);
  }

  async updateSegment(
    context: TenantContext,
    segmentId: string,
    data: unknown
  ): Promise<CrmSegment> {
    assertPermission(context, "crm.segments.manage");
    const validData = SegmentEntity.validateUpdate(data);
    
    if (validData.filterAst) {
      SegmentEntity.validateFilterAst(validData.filterAst);
    }

    return this.segmentRepo.update(context.tenantId, segmentId, validData);
  }

  async deleteSegment(context: TenantContext, segmentId: string): Promise<void> {
    assertPermission(context, "crm.segments.manage");
    await this.segmentRepo.delete(context.tenantId, segmentId);
  }

  /**
   * Evaluates the segment AST and returns a parameterized SQL query fragment
   * that can be appended to `WHERE tenant_id = $1 AND (` + query + `)`
   */
  compileAst(ast: SegmentFilterAst, startingParamIndex: number = 2): { sql: string; values: any[]; nextParamIndex: number } {
    const values: any[] = [];
    let nextParamIndex = startingParamIndex;

    const compileNode = (node: SegmentFilterAst): string => {
      if (node.type === "group") {
        if (node.conditions.length === 0) return "1=1";
        const parts = node.conditions.map(c => compileNode(c));
        return `(${parts.join(` ${node.logic.toUpperCase()} `)})`;
      } else if (node.type === "condition") {
        return this.compileCondition(node, (val) => {
          values.push(val);
          return `$${nextParamIndex++}`;
        });
      }
      return "1=1";
    };

    const sql = compileNode(ast);
    return { sql, values, nextParamIndex };
  }

  private compileCondition(condition: FilterCondition, paramMapper: (val: any) => string): string {
    // Basic protection against SQL injection on the field name itself.
    // In a real app, you'd map "field" to actual DB columns or JSONB paths securely.
    // Assuming fields are safe or pre-validated:
    let fieldRef = `contacts."${condition.field}"`;
    
    // For custom fields (JSONB):
    if (condition.field.startsWith("custom_")) {
       const key = condition.field.replace("custom_", "");
       fieldRef = `contacts.custom_fields->>'${key}'`;
    } else if (condition.field === "tags") {
       // specific logic for tags can be implemented via subqueries
       fieldRef = `(SELECT array_agg(tag_id) FROM contact_tags WHERE contact_id = contacts.id)`;
    }

    switch (condition.operator) {
      case "eq":
        return `${fieldRef} = ${paramMapper(condition.value)}`;
      case "neq":
        return `${fieldRef} != ${paramMapper(condition.value)}`;
      case "contains":
        return `${fieldRef} ILIKE ${paramMapper(`%${condition.value}%`)}`;
      case "not_contains":
        return `${fieldRef} NOT ILIKE ${paramMapper(`%${condition.value}%`)}`;
      case "gt":
        return `${fieldRef} > ${paramMapper(condition.value)}`;
      case "lt":
        return `${fieldRef} < ${paramMapper(condition.value)}`;
      case "gte":
        return `${fieldRef} >= ${paramMapper(condition.value)}`;
      case "lte":
        return `${fieldRef} <= ${paramMapper(condition.value)}`;
      case "in":
        // simple IN support using ANY
        return `${fieldRef} = ANY(${paramMapper(condition.value)})`;
      case "not_in":
        return `${fieldRef} != ALL(${paramMapper(condition.value)})`;
      case "is_set":
        return `${fieldRef} IS NOT NULL`;
      case "is_not_set":
        return `${fieldRef} IS NULL`;
      default:
        return "1=1";
    }
  }

  async previewSegment(context: TenantContext, filterAst: unknown): Promise<{ count: number }> {
    assertPermission(context, "crm.segments.read");
    const ast = SegmentEntity.validateFilterAst(filterAst);
    
    const compiled = this.compileAst(ast, 2);
    const query = `
      SELECT COUNT(*) as count 
      FROM contacts 
      WHERE tenant_id = $1 AND (${compiled.sql})
    `;
    const values = [context.tenantId, ...compiled.values];

    const result = await this.db.query<{ count: string }>(query, values);
    return { count: parseInt(result[0].count, 10) };
  }
}
