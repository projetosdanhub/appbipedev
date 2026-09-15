export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  customFields: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContactInput = Omit<Contact, "id" | "tenantId" | "createdAt" | "updatedAt">;
export type UpdateContactInput = Partial<CreateContactInput>;
