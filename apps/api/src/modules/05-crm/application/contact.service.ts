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

  async updateContact(context: TenantContext, contactId: string, expectedVersion: number, input: UpdateContactInput): Promise<Contact> {
    assertPermission(context, "crm.contacts.update");
    const contact = await this.contactRepository.update(context.tenantId, contactId, expectedVersion, input);
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

  async assign(
    context: TenantContext, 
    contactId: string, 
    expectedVersion: number, 
    departmentId: string | null, 
    routingRoleId: string | null, 
    assignedMembershipId: string | null
  ): Promise<Contact> {
    assertPermission(context, "crm.contacts.assign");
    const contact = await this.contactRepository.assign(context.tenantId, contactId, expectedVersion, departmentId, routingRoleId, assignedMembershipId, context.membershipId);
    if (!contact) {
      throw new Error("CONFLICT");
    }
    return contact;
  }

  async claim(context: TenantContext, contactId: string, expectedVersion: number): Promise<Contact> {
    assertPermission(context, "crm.contacts.claim");
    const current = await this.contactRepository.findById(context.tenantId, contactId);
    if (!current) throw new Error("NOT_FOUND");
    if (current.version !== expectedVersion) throw new Error("CONFLICT");

    const contact = await this.contactRepository.assign(
      context.tenantId, 
      contactId, 
      expectedVersion, 
      current.departmentId, 
      current.routingRoleId, 
      context.membershipId,
      context.membershipId
    );
    if (!contact) {
      throw new Error("CONFLICT");
    }
    return contact;
  }

  async release(context: TenantContext, contactId: string, expectedVersion: number): Promise<Contact> {
    assertPermission(context, "crm.contacts.assign");
    const current = await this.contactRepository.findById(context.tenantId, contactId);
    if (!current) throw new Error("NOT_FOUND");
    if (current.version !== expectedVersion) throw new Error("CONFLICT");

    const contact = await this.contactRepository.assign(
      context.tenantId, 
      contactId, 
      expectedVersion, 
      current.departmentId, 
      current.routingRoleId, 
      null,
      context.membershipId
    );
    if (!contact) {
      throw new Error("CONFLICT");
    }
    return contact;
  }
}
