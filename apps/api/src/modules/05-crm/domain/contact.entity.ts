export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  emailNormalized: string | null;
  phone: string | null;
  phoneE164: string | null;
  phoneCountry: string | null;
  source: "manual" | "csv_import";
  customFields: Record<string, any>;
  departmentId: string | null;
  routingRoleId: string | null;
  assignedMembershipId: string | null;
  createdByMembershipId: string | null;
  updatedByMembershipId: string | null;
  status: "active" | "archived";
  archivedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContactInput = {
  name: string;
  email?: string | null;
  emailNormalized?: string | null;
  phone?: string | null;
  phoneE164?: string | null;
  phoneCountry?: string | null;
  source?: "manual" | "csv_import";
  customFields?: Record<string, any>;
  departmentId?: string | null;
  routingRoleId?: string | null;
  assignedMembershipId?: string | null;
  createdByMembershipId?: string | null;
  status?: "active" | "archived";
};

export type UpdateContactInput = Partial<CreateContactInput> & {
  archivedAt?: Date | null;
  updatedByMembershipId?: string | null;
};
