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
  "workspace.shell.read",
  "dashboard.read",
  "crm.contacts.read",
  "crm.contacts.create",
  "crm.contacts.update",
  "crm.contacts.delete",
  "crm.contacts.export",
  "crm.import.manage",

  "crm.deals.read",
  "crm.deals.write",
  "crm.pipelines.manage",
  "crm.tags.read",
  "crm.tags.manage",
  "crm.tags.assign",
  "crm.segments.read",
  "crm.segments.manage",
  "inbox.conversations.read",
  "inbox.conversations.reply",
  "inbox.conversations.assign",
  "inbox.conversations.claim",
  "crm.contacts.assign",
  "crm.contacts.claim",
  "crm.deals.assign",
  "crm.deals.claim",
  "campaigns.manage",
  "automations.manage",
  "knowledge.manage",
  "integrations.manage",
  "team.members.read",
  "team.members.invite",
  "team.members.manage",
  "team.members.impersonate",
  "team.members.manage_security",
  "team.departments.read",
  "team.departments.manage",
  "team.roles.read",
  "team.roles.manage",
  "team.audit.read",
  "team.audit.manage",
  "chat.messages.read",
  "chat.messages.send",
  "chat.history.read",
  "email.addresses.manage",
  "email.templates.manage",
  "settings.tenant.read",
  "settings.tenant.update",
  "settings.billing.read",
  "settings.billing.manage",
  "settings.security.read",
  "settings.security.manage",
  "settings.integrations.manage",
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
    globalPermissions: z.array(permissionSchema),
    departmentGrants: z.record(idSchema, z.array(permissionSchema)),
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
  "TEAM_ACCESS_PLAN_REQUIRED",
  "TEAM_ROLE_SCOPE_MISMATCH",
  "MEMBERSHIP_NOT_FOUND",
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

export const auditLogSchema = z
  .object({
    id: idSchema,
    tenantId: idSchema.nullable(),
    actorId: idSchema.nullable(),
    targetId: idSchema.nullable(),
    action: z.string().max(100),
    details: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.iso.datetime(),
  })
  .strict();
export type AuditLog = z.infer<typeof auditLogSchema>;

export const auditLogListParamsSchema = paginationSchema.extend({
  actorId: idSchema.optional(),
  action: z.string().max(100).optional(),
});
export type AuditLogListParams = z.infer<typeof auditLogListParamsSchema>;

export const auditLogListResponseSchema = z.object({
  data: z.array(auditLogSchema),
  nextCursor: z.string().nullable(),
});
export type AuditLogListResponse = z.infer<typeof auditLogListResponseSchema>;

export const errorReportStatusSchema = z.enum(["open", "investigating", "resolved", "ignored"]);
export type ErrorReportStatus = z.infer<typeof errorReportStatusSchema>;

export const errorReportSchema = z.object({
  id: idSchema,
  tenantId: idSchema.nullable(),
  actorId: idSchema.nullable(),
  requestId: requestIdSchema,
  errorCode: z.string().max(100),
  context: z.record(z.string(), z.unknown()).nullable(),
  status: errorReportStatusSchema,
  createdAt: z.iso.datetime(),
}).strict();
export type ErrorReport = z.infer<typeof errorReportSchema>;

export const errorReportListParamsSchema = paginationSchema.extend({
  status: errorReportStatusSchema.optional(),
  errorCode: z.string().max(100).optional(),
});
export type ErrorReportListParams = z.infer<typeof errorReportListParamsSchema>;

export const errorReportListResponseSchema = z.object({
  data: z.array(errorReportSchema),
  nextCursor: z.string().nullable(),
});
export type ErrorReportListResponse = z.infer<typeof errorReportListResponseSchema>;

export const crmContactStatusSchema = z.enum(["active", "archived"]);

export const crmContactSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  name: z.string().min(1).max(255),
  email: emailSchema.nullable(),
  emailNormalized: emailSchema.nullable(),
  phone: z.string().max(50).nullable(),
  phoneE164: z.string().max(50).nullable(),
  phoneCountry: z.string().max(2).nullable(),
  source: z.enum(["manual", "csv_import"]).default("manual"),
  customFields: z.record(z.string(), z.unknown()).default({}),
  departmentId: idSchema.nullable(),
  routingRoleId: idSchema.nullable(),
  assignedMembershipId: idSchema.nullable(),
  createdByMembershipId: idSchema.nullable(),
  updatedByMembershipId: idSchema.nullable(),
  status: crmContactStatusSchema.default("active"),
  archivedAt: z.iso.datetime().nullable(),
  version: z.number().int().positive().default(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const createCrmContactSchema = crmContactSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  emailNormalized: true,
  phoneE164: true,
  phoneCountry: true,
  version: true,
  archivedAt: true,
  createdByMembershipId: true,
  updatedByMembershipId: true,
}).strict();

export const updateCrmContactSchema = createCrmContactSchema.partial().strict();

export type CrmContactStatus = z.infer<typeof crmContactStatusSchema>;
export type CrmContact = z.infer<typeof crmContactSchema>;
export type CreateCrmContact = z.infer<typeof createCrmContactSchema>;
export type UpdateCrmContact = z.infer<typeof updateCrmContactSchema>;

export const errorReportUpdateSchema = z.object({
  status: errorReportStatusSchema,
}).strict();
export type ErrorReportUpdate = z.infer<typeof errorReportUpdateSchema>;

export const crmTagSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  name: z.string().min(1).max(100),
  nameNormalized: z.string().nullable(),
  colorToken: z.string().max(50).nullable(),
  status: z.string().max(50),
  version: z.number().int().positive(),
  createdByMembershipId: idSchema.nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const createCrmTagSchema = crmTagSchema.omit({
  id: true,
  tenantId: true,
  nameNormalized: true,
  version: true,
  createdByMembershipId: true,
  createdAt: true,
  updatedAt: true,
}).strict();

export const updateCrmTagSchema = createCrmTagSchema.partial().strict();

export type CrmTag = z.infer<typeof crmTagSchema>;
export type CreateCrmTag = z.infer<typeof createCrmTagSchema>;
export type UpdateCrmTag = z.infer<typeof updateCrmTagSchema>;

export const crmContactTagSchema = z.object({
  tenantId: idSchema,
  contactId: idSchema,
  tagId: idSchema,
  createdByMembershipId: idSchema.nullable(),
  createdAt: z.iso.datetime(),
}).strict();

export const createCrmContactTagSchema = z.object({
  tagId: idSchema,
}).strict();

export type CrmContactTag = z.infer<typeof crmContactTagSchema>;
export type CreateCrmContactTag = z.infer<typeof createCrmContactTagSchema>;

export const filterOperatorSchema = z.enum([
  "eq", "neq", "contains", "not_contains", "gt", "lt", "gte", "lte", "in", "not_in", "is_set", "is_not_set"
]);
export type FilterOperator = z.infer<typeof filterOperatorSchema>;

export const filterConditionSchema = z.object({
  type: z.literal("condition"),
  field: z.string().min(1),
  operator: filterOperatorSchema,
  value: z.any().optional(),
}).strict();
export type FilterCondition = z.infer<typeof filterConditionSchema>;

// Recursive type for AST
export type FilterGroup = {
  type: "group";
  logic: "and" | "or";
  conditions: Array<FilterCondition | FilterGroup>;
};

export const filterGroupSchema: z.ZodType<FilterGroup> = z.lazy(() =>
  z.object({
    type: z.literal("group"),
    logic: z.enum(["and", "or"]),
    conditions: z.array(z.union([filterConditionSchema, filterGroupSchema])),
  }).strict()
);

export const segmentFilterAstSchema = z.union([filterConditionSchema, filterGroupSchema]);
export type SegmentFilterAst = z.infer<typeof segmentFilterAstSchema>;

export const crmSegmentSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  name: z.string().min(1).max(100),
  description: z.string().nullable(),
  filterAst: segmentFilterAstSchema,
  schemaVersion: z.number().int().positive(),
  version: z.number().int().positive(),
  visibility: z.enum(["private", "tenant"]),
  ownerMembershipId: idSchema.nullable(),
  status: z.string().max(50),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const createCrmSegmentSchema = crmSegmentSchema.omit({
  id: true,
  tenantId: true,
  schemaVersion: true,
  version: true,
  ownerMembershipId: true,
  createdAt: true,
  updatedAt: true,
}).strict();

export const updateCrmSegmentSchema = createCrmSegmentSchema.partial().strict();

export type CrmSegment = z.infer<typeof crmSegmentSchema>;
export type CreateCrmSegment = z.infer<typeof createCrmSegmentSchema>;
export type UpdateCrmSegment = z.infer<typeof updateCrmSegmentSchema>;

export const customFieldStatusSchema = z.enum(["active", "archived"]);

export const customFieldSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  entityType: z.enum(["contact"]),
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  tooltip: z.string().nullable().optional(),
  type: z.enum(["text", "number", "date", "boolean", "select"]),
  options: z.array(z.string()).nullable(),
  validation: z.record(z.string(), z.unknown()).nullable().optional(),
  status: customFieldStatusSchema.default("active"),
  createdByMembershipId: idSchema.nullable(),
  updatedByMembershipId: idSchema.nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const createCustomFieldSchema = customFieldSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdByMembershipId: true,
  updatedByMembershipId: true,
}).strict();

export const updateCustomFieldSchema = createCustomFieldSchema.partial().strict();

export type CustomFieldStatus = z.infer<typeof customFieldStatusSchema>;
export type CustomField = z.infer<typeof customFieldSchema>;
export type CreateCustomField = z.infer<typeof createCustomFieldSchema>;
export type UpdateCustomField = z.infer<typeof updateCustomFieldSchema>;

export const importBatchStatusSchema = z.enum([
  "preview_ready",
  "preview_invalid",
  "committed",
  "cancelled",
  "expired",
]);

export const contactImportBatchSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  createdByMembershipId: idSchema,
  status: importBatchStatusSchema,
  requestKey: z.string().max(255),
  payloadHash: z.string().max(255),
  mapping: z.record(z.string(), z.string()).nullable(),
  parseOptions: z.record(z.string(), z.unknown()).nullable(),
  definitionSnapshot: z.record(z.string(), z.unknown()).nullable(),
  stagedRows: z.array(z.record(z.string(), z.unknown())).nullable(),
  rowIssues: z.array(z.object({
    rowIndex: z.number(),
    issues: z.array(z.string()),
  })).nullable(),
  selectionHash: z.string().max(255).nullable(),
  confirmationKey: z.string().max(255).nullable(),
  totalRows: z.number().int().nonnegative(),
  selectedRows: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  resultReferences: z.record(z.string(), z.unknown()).nullable(),
  version: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  committedAt: z.iso.datetime().nullable(),
}).strict();

export const createImportPreviewSchema = z.object({
  requestKey: z.string().min(1).max(255),
  payloadHash: z.string().min(1).max(255),
  mapping: z.record(z.string(), z.string()),
  parseOptions: z.record(z.string(), z.unknown()).optional(),
  stagedRows: z.array(z.record(z.string(), z.unknown())),
}).strict();

export const commitImportSchema = z.object({
  confirmationKey: z.string().min(1).max(255),
}).strict();

export type ContactImportBatch = z.infer<typeof contactImportBatchSchema>;
export type CreateImportPreview = z.infer<typeof createImportPreviewSchema>;
export type CommitImport = z.infer<typeof commitImportSchema>;

// --- CRM-003: Pipelines e Negocios ---

export const pipelineStatusSchema = z.enum(["active", "archived"]);

export const crmPipelineSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  name: z.string().min(1).max(100),
  nameNormalized: z.string().min(1).max(100),
  description: z.string().nullable(),
  status: pipelineStatusSchema,
  defaultCurrency: z.string().length(3).default("BRL"),
  version: z.number().int().positive(),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export const createCrmPipelineSchema = crmPipelineSchema.pick({
  name: true,
  description: true,
  defaultCurrency: true,
}).extend({
  isDefault: z.boolean().optional(),
});

export const updateCrmPipelineSchema = createCrmPipelineSchema.partial().extend({
  status: pipelineStatusSchema.optional(),
});

export const pipelineStageCategorySchema = z.enum(["open", "won", "lost"]);

export const pipelineStageRuleItemSchema = z.object({
  entity: z.enum(["contact", "deal"]),
  field: z.string().min(1).max(100),
  type: z.enum(["native", "custom"]),
}).strict();

export const pipelineStageRulesSchema = z.object({
  version: z.literal(1),
  rules: z.array(pipelineStageRuleItemSchema),
}).strict();

export const crmPipelineStageSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  pipelineId: idSchema,
  name: z.string().min(1).max(100),
  position: z.number().int().min(0),
  colorToken: z.string().min(1).max(50),
  category: pipelineStageCategorySchema,
  requiredFieldRules: pipelineStageRulesSchema,
  version: z.number().int().positive(),
  archivedAt: z.string().datetime().nullable(),
}).strict();

export const createCrmPipelineStageSchema = crmPipelineStageSchema.pick({
  pipelineId: true,
  name: true,
  colorToken: true,
  category: true,
  requiredFieldRules: true,
}).extend({
  position: z.number().int().min(0).optional(),
});

export const updateCrmPipelineStageSchema = createCrmPipelineStageSchema.omit({ pipelineId: true }).partial().extend({
  archivedAt: z.string().datetime().nullable().optional(),
});

export const crmDealSchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  contactId: idSchema,
  pipelineId: idSchema,
  stageId: idSchema,
  title: z.string().min(1).max(255),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/), // Decimal string
  currency: z.string().length(3),
  expectedCloseDate: z.string().datetime().nullable(),
  closedAt: z.string().datetime().nullable(),
  lostReason: z.string().max(1000).nullable(),
  departmentId: idSchema.nullable(),
  routingRoleId: idSchema.nullable(),
  assignedMembershipId: idSchema.nullable(),
  createdByMembershipId: idSchema,
  updatedByMembershipId: idSchema,
  version: z.number().int().positive(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export const createCrmDealSchema = z.object({
  contactId: idSchema.nullable().optional(),
  pipelineId: idSchema,
  stageId: idSchema,
  title: z.string().min(1).max(255),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  currency: z.string().length(3).optional(),
  expectedCloseDate: z.string().datetime().nullable().optional(),
  departmentId: idSchema.nullable().optional(),
  routingRoleId: idSchema.nullable().optional(),
  assignedMembershipId: idSchema.nullable().optional(),
}).strict();

export const updateCrmDealSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  expectedCloseDate: z.string().datetime().nullable().optional(),
  departmentId: idSchema.nullable().optional(),
  routingRoleId: idSchema.nullable().optional(),
  assignedMembershipId: idSchema.nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
}).strict();

export const moveCrmDealSchema = z.object({
  expectedVersion: z.number().int().positive(),
  toStageId: idSchema,
  lostReason: z.string().max(1000).optional(),
}).strict();

export const crmDealStageHistorySchema = z.object({
  id: idSchema,
  tenantId: idSchema,
  dealId: idSchema,
  fromStageId: idSchema.nullable(),
  toStageId: idSchema,
  actorMembershipId: idSchema.nullable(),
  reason: z.string().max(1000).nullable(),
  occurredAt: z.string().datetime(),
  version: z.number().int().positive(),
}).strict();

export type CrmPipeline = z.infer<typeof crmPipelineSchema>;
export type CreateCrmPipeline = z.infer<typeof createCrmPipelineSchema>;
export type UpdateCrmPipeline = z.infer<typeof updateCrmPipelineSchema>;

export type PipelineStageRuleItem = z.infer<typeof pipelineStageRuleItemSchema>;
export type PipelineStageRules = z.infer<typeof pipelineStageRulesSchema>;
export type CrmPipelineStage = z.infer<typeof crmPipelineStageSchema>;
export type CreateCrmPipelineStage = z.infer<typeof createCrmPipelineStageSchema>;
export type UpdateCrmPipelineStage = z.infer<typeof updateCrmPipelineStageSchema>;

export type CrmDeal = z.infer<typeof crmDealSchema>;
export type CreateCrmDeal = z.infer<typeof createCrmDealSchema>;
export type UpdateCrmDeal = z.infer<typeof updateCrmDealSchema>;
export type MoveCrmDeal = z.infer<typeof moveCrmDealSchema>;
export type CrmDealStageHistory = z.infer<typeof crmDealStageHistorySchema>;

// --- CRM-006: Atribuição ---

export const assignmentTargetSchema = z.object({
  departmentId: idSchema.nullable(),
  routingRoleId: idSchema.nullable(),
  assignedMembershipId: idSchema.nullable(),
  expectedVersion: z.number().int().positive(),
}).strict();

export const claimResourceBodySchema = z.object({
  expectedVersion: z.number().int().positive(),
}).strict();

export type AssignmentTarget = z.infer<typeof assignmentTargetSchema>;
export type ClaimResourceBody = z.infer<typeof claimResourceBodySchema>;

export * from "./inbox.js";
export * from "./messaging.js";
export * from "./connection.js";
export * from "./ai.js";
export * from "./voice-profile.schema.js";
