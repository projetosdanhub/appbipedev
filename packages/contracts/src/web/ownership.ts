import { z } from "zod";
import { idSchema, requestIdSchema } from "../index.js";
import { foodCatalogSettingsSchema } from "../catalog/index.js";

/** Shape only. An API must resolve the space and actor from an authenticated session. */
export const publishingSpaceSchema = z.discriminatedUnion("scope", [
  z.strictObject({ scope: z.literal("tenant"), spaceId: idSchema, tenantId: idSchema }),
  z.strictObject({ scope: z.literal("platform"), spaceId: idSchema }),
]);
export type PublishingSpace = z.infer<typeof publishingSpaceSchema>;

const siteFields = { title: z.string().trim().min(1).max(120), slug: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) };
export const siteCreationIntentSchema = z.discriminatedUnion("kind", [
  z.strictObject({ ...siteFields, kind: z.literal("landing") }),
  z.strictObject({ ...siteFields, kind: z.literal("food"), catalog: foodCatalogSettingsSchema }),
]);
export type SiteCreationIntent = z.infer<typeof siteCreationIntentSchema>;

/** Separate envelope. The existing tenant event's tenantId stays REQUIRED. */
export const platformPagePublishedEventSchema = z.strictObject({
  id: idSchema, name: z.literal("web.page.published.v1"), scope: z.literal("platform"),
  spaceId: idSchema, actorId: idSchema, correlationId: requestIdSchema, occurredAt: z.iso.datetime(),
  data: z.strictObject({ siteId: idSchema, pageId: idSchema, releaseId: idSchema, generation: z.number().int().positive() }),
});
