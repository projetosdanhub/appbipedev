import { logger as baseLogger } from "@bipesend/logger";

// Export the base logger for generic usage across the API.
// We can also configure specific defaults here if needed (e.g. environment).
export const logger = baseLogger.withContext({
  app: "api",
  env: process.env.NODE_ENV || "development"
});
