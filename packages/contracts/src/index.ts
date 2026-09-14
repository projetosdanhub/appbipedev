import { z } from "zod";

export const idSchema = z.uuid();
export const requestIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
// Product policy retained for compatibility; changes require a migration of every auth surface.
export const passwordSchema = z
  .string()
  .min(9)
  .max(128)
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "A senha deve conter pelo menos 1 caractere especial.",
  );
export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "Informe os 6 dígitos do código.");
export const tenantRoleSchema = z.enum([
  "tenant_admin",
  "manager",
  "agent",
  "viewer",
]);
export type TenantRole = z.infer<typeof tenantRoleSchema>;
export const permissionSchema = z.enum([
  "dashboard.read",
  "crm.contacts.read",
  "crm.contacts.write",
  "crm.deals.read",
  "crm.deals.write",
  "inbox.conversations.read",
  "inbox.conversations.reply",
  "inbox.conversations.assign",
  "campaigns.manage",
  "automations.manage",
  "catalog.manage",
  "knowledge.manage",
  "integrations.manage",
  "team.members.read",
  "team.members.manage",
  "team.roles.manage",
  "billing.subscription.manage",
  "settings.security.manage",
  "audit.read",
  "data.export",
]);
export type Permission = z.infer<typeof permissionSchema>;
export const tenantContextSchema = z
  .object({
    tenantId: idSchema,
    userId: idSchema,
    membershipId: idSchema,
    requestId: requestIdSchema,
    role: tenantRoleSchema,
    permissions: z.array(permissionSchema),
  })
  .strict();
/** A parsed shape is NOT proof of authentication; resolve membership server-side. */
export type TenantContext = Readonly<z.infer<typeof tenantContextSchema>>;

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional(),
});
export const errorCodeSchema = z.enum([
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_REQUIRED",
  "AUTH_RATE_LIMITED",
  "AUTH_CODE_INVALID",
  "AUTH_CODE_EXPIRED",
  "TENANT_ACCESS_DENIED",
  "PERMISSION_DENIED",
  "VALIDATION_FAILED",
  "CONFLICT",
  "NOT_FOUND",
  "INTEGRATION_UNAVAILABLE",
  "SERVICE_UNAVAILABLE",
  "INTERNAL_ERROR",
]);
export const errorEnvelopeSchema = z
  .object({
    error: z
      .object({
        code: errorCodeSchema,
        message: z.string().max(300),
        requestId: requestIdSchema,
      })
      .strict(),
  })
  .strict();
export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
export const integrationStateSchema = z.enum([
  "connected",
  "degraded",
  "disconnected",
  "misconfigured",
  "not_entitled",
  "disabled",
  "unknown",
]);
export type IntegrationState = z.infer<typeof integrationStateSchema>;
export const integrationHealthSchema = z
  .object({
    provider: z.string().min(1).max(80),
    state: integrationStateSchema,
    checkedAt: z.iso.datetime().nullable(),
    latencyMs: z.number().nonnegative().nullable(),
  })
  .strict();
export const healthSchema = z
  .object({
    status: z.enum(["ok", "degraded"]),
    requestId: requestIdSchema.optional(),
  })
  .strict();
export const readinessSchema = z
  .object({
    status: z.enum(["ok", "degraded", "unavailable"]),
    dependencies: z.record(z.string(), z.object({
      state: integrationStateSchema,
      latencyMs: z.number().nonnegative().optional()
    })),
    requestId: requestIdSchema.optional()
  })
  .strict();
export const tenantInvitationSchema = z
  .object({
    email: emailSchema,
    role: tenantRoleSchema.exclude(["tenant_admin"]),
  })
  .strict();

export const eventNameSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.v[1-9]\d*$/);
export const eventEnvelopeSchema = z
  .object({
    id: idSchema,
    name: eventNameSchema,
    tenantId: idSchema,
    actorId: idSchema,
    correlationId: requestIdSchema,
    occurredAt: z.iso.datetime(),
    data: z.record(z.string(), z.unknown()),
  })
  .strict();
export type DomainEvent = z.infer<typeof eventEnvelopeSchema>;
export const auditEventSchema = z
  .object({
    id: idSchema,
    tenantId: idSchema.nullable(),
    actorId: idSchema,
    action: permissionSchema,
    resourceId: idSchema.nullable(),
    result: z.enum(["allowed", "denied", "failed"]),
    requestId: requestIdSchema,
    occurredAt: z.iso.datetime(),
  })
  .strict();
