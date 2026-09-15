import {
  permissionSchema,
  tenantContextSchema,
  tenantRoleSchema,
  type Permission,
  type TenantContext,
  type TenantRole,
} from "@bipesend/contracts";

export const rolePermissions: Readonly<
  Record<TenantRole, readonly Permission[]>
> = Object.freeze({
  tenant_admin: permissionSchema.options,
  manager: [
    "workspace.shell.read",
    "dashboard.read",
    "crm.contacts.read",
    "crm.contacts.create",
    "crm.contacts.update",
    "crm.contacts.delete",
    "crm.contacts.export",
    "crm.import.manage",
    "crm.pipelines.manage",
    "crm.deals.read",
    "crm.deals.write",
    "crm.tags.read",
    "crm.tags.manage",
    "crm.tags.assign",
    "crm.segments.read",
    "crm.segments.manage",
    "inbox.conversations.read",
    "inbox.conversations.reply",
    "inbox.conversations.assign",
    "team.members.read",
    "team.members.invite",
    "team.members.manage",
    "team.departments.read",
    "team.departments.manage",
    "team.roles.read",
    "chat.messages.read",
    "chat.messages.send",
    "chat.history.read",
    "team.audit.read",
    "team.audit.manage",
    "audit.read",
  ],
  agent: [
    "workspace.shell.read",
    "dashboard.read",
    "crm.contacts.read",
    "crm.contacts.create",
    "crm.contacts.update",
    "crm.deals.read",
    "crm.deals.write",
    "crm.tags.read",
    "crm.tags.assign",
    "crm.segments.read",
    "inbox.conversations.read",
    "inbox.conversations.reply",
    "team.members.read",
    "team.departments.read",
    "chat.messages.read",
    "chat.messages.send",
  ],
  viewer: [
    "workspace.shell.read",
    "dashboard.read",
    "crm.contacts.read",
    "crm.deals.read",
    "crm.tags.read",
    "crm.segments.read",
    "inbox.conversations.read",
    "team.members.read",
    "team.departments.read",
  ],
});
export function normalizeTenantRole(value: string): TenantRole {
  // Compatibility with historical SQL roles; do not silently accept unknown roles.
  return tenantRoleSchema.parse(
    value === "admin" ? "tenant_admin" : value === "member" ? "agent" : value,
  );
}
export function hasPermission(
  context: TenantContext,
  permission: Permission,
  resourceTenantId: string,
): boolean {
  return (
    context.tenantId === resourceTenantId &&
    context.permissions.includes(permission) &&
    rolePermissions[context.role]?.includes(permission) === true
  );
}
export function assertPermission(
  context: TenantContext,
  permission: Permission,
  resourceTenantId = context.tenantId,
): void {
  tenantContextSchema.parse(context);
  if (!hasPermission(context, permission, resourceTenantId))
    throw new Error("PERMISSION_DENIED");
}
export function canGrantRole(
  context: TenantContext,
  role: TenantRole,
): boolean {
  if (
    (role === "tenant_admin" && context.role !== "tenant_admin") ||
    !hasPermission(context, "team.members.manage", context.tenantId)
  )
    return false;
  return rolePermissions[role].every(
    (permission) =>
      context.permissions.includes(permission) &&
      rolePermissions[context.role].includes(permission),
  );
}
export function canManageTargetRole(
  context: TenantContext,
  targetRole: string,
): boolean {
  if (context.role !== "tenant_admin" && normalizeTenantRole(targetRole) === "tenant_admin") {
    return false; // Only admins can manage admins
  }
  return hasPermission(context, "team.members.manage", context.tenantId);
}
export interface MembershipLookup {
  findMembership(
    userId: string,
    tenantId: string,
  ): Promise<{
    id: string;
    userId: string;
    tenantId: string;
    role: string;
    active: boolean;
  } | null>;
}
/** Call only after verifying the session. The tenant selector never grants authority. */
export async function resolveTenantContext(
  lookup: MembershipLookup,
  input: { userId: string; tenantId: string; requestId: string },
): Promise<TenantContext> {
  const member = await lookup.findMembership(input.userId, input.tenantId);
  if (
    !member?.active ||
    member.userId !== input.userId ||
    member.tenantId !== input.tenantId
  )
    throw new Error("TENANT_ACCESS_DENIED");
  const role = normalizeTenantRole(member.role);
  return Object.freeze(
    tenantContextSchema.parse({
      ...input,
      membershipId: member.id,
      role,
      permissions: rolePermissions[role],
    }),
  );
}
