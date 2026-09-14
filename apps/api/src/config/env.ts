import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseApiEnv, type ApiEnv } from "@bipesend/config";
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../../.env"),
});
export type EnvConfig = ApiEnv;
export function loadEnv(): EnvConfig {
  return parseApiEnv(process.env);
}
export const env = loadEnv();
