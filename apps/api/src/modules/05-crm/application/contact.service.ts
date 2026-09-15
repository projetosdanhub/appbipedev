import { Database } from "../../00-shared/infrastructure/database.js";
import { ContactRepository } from "../infrastructure/contact.repository.js";
import { Contact, CreateContactInput, UpdateContactInput } from "../domain/contact.entity.js";
import { assertPermission } from "@bipesend/auth/policies";
import type { TenantContext } from "@bipesend/contracts";

export class ContactService {
  constructor(
    private readonly db: Database,
    private readonly contactRepository: ContactRepository
  ) {}

  async createContact(context: TenantContext, input: CreateContactInput): Promise<Contact> {
    assertPermission(context, "crm.contacts.create");
    return this.contactRepository.create(context.tenantId, input);
  }

  async listContacts(context: TenantContext, limit = 50, offset = 0): Promise<Contact[]> {
    assertPermission(context, "crm.contacts.read");
    return this.contactRepository.list(context.tenantId, limit, offset);
  }

  async getContact(context: TenantContext, contactId: string): Promise<Contact> {
    assertPermission(context, "crm.contacts.read");
    const contact = await this.contactRepository.findById(context.tenantId, contactId);
    if (!contact) {
      throw new Error("NOT_FOUND");
    }
    return contact;
  }

  async updateContact(context: TenantContext, contactId: string, input: UpdateContactInput): Promise<Contact> {
    assertPermission(context, "crm.contacts.update");
    const contact = await this.contactRepository.update(context.tenantId, contactId, input);
    if (!contact) {
      throw new Error("NOT_FOUND");
    }
    return contact;
  }

  async deleteContact(context: TenantContext, contactId: string): Promise<void> {
    assertPermission(context, "crm.contacts.delete");
    const deleted = await this.contactRepository.delete(context.tenantId, contactId);
    if (!deleted) {
      throw new Error("NOT_FOUND");
    }
  }
}
