export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  customFields: Record<string, any> | null;
  departmentId: string | null;
  routingRoleId: string | null;
  assignedMembershipId: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContactInput = Omit<Contact, "id" | "tenantId" | "createdAt" | "updatedAt" | "departmentId" | "routingRoleId" | "assignedMembershipId" | "version">;
export type UpdateContactInput = Partial<CreateContactInput>;
