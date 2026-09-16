import { siteCreationIntentSchema } from "@bipesend/contracts/web";
import type { WebCapability, WebQuotaKey } from "@bipesend/contracts/entitlements";

/** A requirement description, never an entitlement check/reservation or permission. */
export function describeSiteCreation(input: unknown): {
  capabilities: WebCapability[];
  quotaChanges: Partial<Record<WebQuotaKey, number>>;
} {
  const intent = siteCreationIntentSchema.parse(input);
  const capabilities: WebCapability[] = ["web.enabled"];
  const quotaChanges: Partial<Record<WebQuotaKey, number>> = { "web.sites.max": 1, "web.pages.max": 1 };
  if (intent.kind === "food") {
    quotaChanges["web.catalogs.max"] = 1;
    if (intent.catalog.fulfillment.includes("delivery")) capabilities.push("food.delivery");
  }
  return { capabilities, quotaChanges };
}
