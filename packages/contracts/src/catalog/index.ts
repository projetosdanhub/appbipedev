import { z } from "zod";

/** Prices cross the wire as decimal strings, never binary floating point. */
export const foodMoneySchema = z.string().regex(/^(0|[1-9]\d{0,8})\.\d{2}$/);
export const foodCatalogSettingsSchema = z.strictObject({
  kind: z.literal("food"),
  currency: z.literal("BRL"),
  fulfillment: z.array(z.enum(["pickup", "delivery"])).min(1).max(2)
    .refine((values) => new Set(values).size === values.length, "Modalidade repetida."),
});
export type FoodCatalogSettings = z.infer<typeof foodCatalogSettingsSchema>;
