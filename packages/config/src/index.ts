import { z } from "zod";

const secret = z
  .string()
  .min(32)
  .refine(
    (value) => !/replace_with|changeme|example|internal_dev_key/i.test(value),
  );
const port = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(1).max(65535));
const serviceUrl = (protocols: string[]) =>
  z
    .string()
    .url()
    .refine((value) => {
      try {
        return protocols.includes(new URL(value).protocol);
      } catch {
        return false;
      }
    });
export const apiEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_NAME: z.string().min(1).max(80).default("BipeSend"),
  API_HOST: z
    .string()
    .regex(/^[a-zA-Z0-9_.:-]+$/)
    .default("127.0.0.1"),
  API_PORT: port.default(4000),
  DATABASE_URL: serviceUrl(["postgres:", "postgresql:"]),
  REDIS_URL: serviceUrl(["redis:", "rediss:"]),
  AUTH_SESSION_SECRET: secret,
  INTERNAL_API_KEY: secret,
});
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export function parseApiEnv(
  input: Readonly<Record<string, string | undefined>>,
): ApiEnv {
  const result = apiEnvSchema.safeParse(input);
  if (!result.success) {
    // Zod issues may contain values in future versions; expose names only.
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(
      `[config] Invalid or missing variables: ${fields.join(", ")}`,
    );
  }
  return Object.freeze(result.data);
}

export function parsePublicOrigin(value: string, production = false): string {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    (production && url.protocol !== "https:")
  ) {
    throw new Error("[config] Invalid public origin");
  }
  return url.origin;
}
export const performanceBudgets = Object.freeze({
  lcpMs: 2500,
  inpMs: 200,
  cls: 0.1,
  queryLimit: 100,
});
