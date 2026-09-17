import { z } from "zod";

export const webCapabilitySchema = z.enum([
  "web.enabled", "web.customSubdomain", "web.rootRouting", "web.customCss",
  "web.customHtml", "web.shortcodes", "web.svgUpload", "web.advancedWidgets",
  "web.forms", "web.tracking", "web.phpExtensions", "food.modifiers",
  "food.delivery", "food.onlinePayments",
]);
export const webQuotaKeySchema = z.enum([
  "web.sites.max", "web.pages.max", "web.catalogs.max", "web.menus.maxPerSite",
  "web.menuItems.maxPerSite", "web.customDomains.max", "web.storageBytes.max",
  "food.products.max",
]);
export const quotaLimitSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("limited"), value: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }),
  z.strictObject({ kind: z.literal("unlimited") }),
]);
export const entitlementSubjectSchema = z.discriminatedUnion("scope", [
  z.strictObject({ scope: z.literal("tenant"), tenantId: z.uuid() }),
  z.strictObject({ scope: z.literal("platform") }),
]);
/** A server projection, NOT a grant supplied by a browser. Missing keys deny access. */
export const webEntitlementSnapshotSchema = z.strictObject({
  subject: entitlementSubjectSchema,
  revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  validFrom: z.iso.datetime(),
  validUntil: z.iso.datetime().nullable(),
  capabilities: z.partialRecord(webCapabilitySchema, z.boolean()),
  quotas: z.partialRecord(webQuotaKeySchema, quotaLimitSchema),
}).refine((value) => value.validUntil === null || Date.parse(value.validUntil) > Date.parse(value.validFrom),
  "A vigência final deve ser posterior à inicial.");

export type WebCapability = z.infer<typeof webCapabilitySchema>;
export type WebQuotaKey = z.infer<typeof webQuotaKeySchema>;
export type QuotaLimit = z.infer<typeof quotaLimitSchema>;
export type WebEntitlementSnapshot = z.infer<typeof webEntitlementSnapshotSchema>;
