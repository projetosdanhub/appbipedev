import { ContactImportBatch, CreateImportPreview, CommitImport } from "@bipesend/contracts";
import { ContactImportRepository } from "../infrastructure/contact-import.repository.js";

export class ContactImportService {
  constructor(private readonly repository: ContactImportRepository) {}

  async createPreview(
    tenantId: string,
    _membershipId: string,
    data: CreateImportPreview
  ): Promise<ContactImportBatch> {
    return this.repository.create(tenantId, data);
  }

  async getBatch(tenantId: string, id: string): Promise<ContactImportBatch> {
    const batch = await this.repository.findById(tenantId, id);
    if (!batch) {
      throw new Error("NOT_FOUND");
    }
    return batch;
  }

  async commit(tenantId: string, id: string, _data: CommitImport): Promise<ContactImportBatch> {
    const batch = await this.repository.findById(tenantId, id);
    if (!batch) {
      throw new Error("NOT_FOUND");
    }
    
    return this.repository.updateStatus(tenantId, id, "processing");
  }
}
