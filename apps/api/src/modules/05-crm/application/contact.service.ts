import { Database } from "../../00-shared/infrastructure/database.js";
import { ContactRepository } from "../infrastructure/contact.repository.js";
import { CustomFieldRepository } from "../infrastructure/custom-field.repository.js";
import { Contact, CreateContactInput, UpdateContactInput } from "../domain/contact.entity.js";
import { assertPermission } from "@bipesend/auth/policies";
import type { TenantContext } from "@bipesend/contracts";

export class ContactService {
  constructor(
    private readonly db: Database,
    private readonly contactRepository: ContactRepository,
    private readonly customFieldRepository: CustomFieldRepository
  ) {}

  private async validateCustomFields(tenantId: string, customFields: Record<string, any> | undefined): Promise<void> {
    if (!customFields || Object.keys(customFields).length === 0) return;

    const definitions = await this.customFieldRepository.list(tenantId, "contact");
    const activeDefinitions = definitions.filter(d => d.status === "active");
    const activeMap = new Map(activeDefinitions.map(d => [d.key, d]));

    for (const [key, value] of Object.entries(customFields)) {
      if (value === null || value === undefined) continue;

      const def = activeMap.get(key);
      if (!def) {
        throw new Error(`BAD_REQUEST: Custom field '${key}' is not defined or active.`);
      }

      switch (def.type) {
        case "text":
          if (typeof value !== "string") throw new Error(`BAD_REQUEST: Custom field '${key}' must be a string.`);
          break;
        case "number":
          if (typeof value !== "number") throw new Error(`BAD_REQUEST: Custom field '${key}' must be a number.`);
          break;
        case "boolean":
          if (typeof value !== "boolean") throw new Error(`BAD_REQUEST: Custom field '${key}' must be a boolean.`);
          break;
        case "date":
          if (typeof value !== "string" || isNaN(Date.parse(value))) throw new Error(`BAD_REQUEST: Custom field '${key}' must be a valid ISO date string.`);
          break;
        case "select":
          if (typeof value !== "string") throw new Error(`BAD_REQUEST: Custom field '${key}' must be a string.`);
          if (def.options && !def.options.includes(value)) {
             throw new Error(`BAD_REQUEST: Custom field '${key}' value '${value}' is not a valid option.`);
          }
          break;
      }

      // Handle simple required validation if present
      const validation = def.validation as any;
      if (validation && validation.required && (value === "" || value === null)) {
         throw new Error(`BAD_REQUEST: Custom field '${key}' is required.`);
      }
    }
  }

  async createContact(context: TenantContext, input: CreateContactInput): Promise<Contact> {
    assertPermission(context, "crm.contacts.create");
    input.createdByMembershipId = context.membershipId;
    await this.validateCustomFields(context.tenantId, input.customFields);
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
    input.updatedByMembershipId = context.membershipId;
    
    if (input.customFields) {
      // In a real patch scenario we might need to merge with existing fields to validate completely,
      // but for MVP we will validate the provided fields.
      await this.validateCustomFields(context.tenantId, input.customFields);
    }
    
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
