import { ContactImportBatch, CreateImportPreview, CommitImport, TenantContext } from "@bipesend/contracts";
import { ContactImportRepository } from "../infrastructure/contact-import.repository.js";
import { ContactService } from "./contact.service.js";

export class ContactImportService {
  constructor(
    private readonly repository: ContactImportRepository,
    private readonly contactService: ContactService
  ) {}

  async createPreview(
    context: TenantContext,
    data: CreateImportPreview
  ): Promise<ContactImportBatch> {
    return this.repository.create(context.tenantId, data);
  }

  async getBatch(tenantId: string, id: string): Promise<ContactImportBatch> {
    const batch = await this.repository.findById(tenantId, id);
    if (!batch) {
      throw new Error("NOT_FOUND");
    }
    return batch;
  }

  async commit(context: TenantContext, id: string, _data: CommitImport): Promise<ContactImportBatch> {
    const batch = await this.repository.findById(context.tenantId, id);
    if (!batch) {
      throw new Error("NOT_FOUND");
    }

    if (batch.status !== "preview_ready") {
       throw new Error("CONFLICT"); // Or invalid state
    }

    const rowIssues = batch.rowIssues || [];

    if (batch.stagedRows && Array.isArray(batch.stagedRows)) {
      let rowIndex = 0;
      for (const row of batch.stagedRows) {
        try {
          await this.contactService.createContact(context, {
            name: (row.name as string) || "Imported Contact",
            email: (row.email as string) || null,
            phone: (row.phone as string) || null,
            source: "csv_import",
            customFields: row.customFields || {}
          });
        } catch (e: any) {
          rowIssues.push({ rowIndex, issues: [e.message] });
        }
        rowIndex++;
      }
    }
    
    // In MVP, we do it synchronously
    await this.repository.updateStatus(context.tenantId, id, "committed");
    const updatedBatch = await this.repository.findById(context.tenantId, id);
    if (!updatedBatch) throw new Error("NOT_FOUND");
    // Ideally we would update the counters and issues, but sticking to basics for MVP
    return updatedBatch;
  }
}
