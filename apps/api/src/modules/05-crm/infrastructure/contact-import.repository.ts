import { Database } from "../../00-shared/infrastructure/database.js";
import { ContactImportBatch, CreateImportPreview } from "@bipesend/contracts";

export class ContactImportRepository {
  constructor(private readonly db: Database) {}

  async create(tenantId: string, input: CreateImportPreview): Promise<ContactImportBatch> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `INSERT INTO contact_import_batches (tenant_id, status, request_key, payload_hash, mapping, staged_rows, row_issues)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, tenant_id as "tenantId", status, request_key as "requestKey", payload_hash as "payloadHash", mapping, staged_rows as "stagedRows", row_issues as "rowIssues", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, "preview", input.requestKey, input.payloadHash, JSON.stringify(input.mapping), JSON.stringify(input.stagedRows), "[]"]
      );
      return res[0];
    }, tenantId);
  }

  async findById(tenantId: string, id: string): Promise<ContactImportBatch | null> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `SELECT id, tenant_id as "tenantId", status, request_key as "requestKey", payload_hash as "payloadHash", mapping, staged_rows as "stagedRows", row_issues as "rowIssues", created_at as "createdAt", updated_at as "updatedAt"
         FROM contact_import_batches
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, id]
      );
      return res[0] || null;
    }, tenantId);
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<ContactImportBatch> {
    return this.db.withTransaction(async (txDb) => {
      const res = await txDb.query(
        `UPDATE contact_import_batches SET status = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3
         RETURNING id, tenant_id as "tenantId", status, request_key as "requestKey", payload_hash as "payloadHash", mapping, staged_rows as "stagedRows", row_issues as "rowIssues", created_at as "createdAt", updated_at as "updatedAt"`,
        [status, tenantId, id]
      );
      return res[0];
    }, tenantId);
  }
}
