export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  /** Compatibility only: unknown keys are omitted from emitted logs. */
  [key: string]: unknown;
}

const identifierKeys = new Set(["requestId", "tenantId", "userId", "membershipId", "correlationId", "spaceId", "siteId", "pageId", "releaseId"]);
const codeKeys = new Set(["code", "operation", "component", "app"]);
const metricKeys = new Set(["durationMs", "count", "attempt", "generation", "revision"]);
const errorPrototypes = new Map<object, string>([Error, TypeError, RangeError, SyntaxError, ReferenceError, URIError, EvalError, AggregateError].map((type) => [type.prototype, type.name]));

function safeError(error: Error): { name: string } {
  // Do not serialize message, stack, cause or provider/custom error properties.
  return { name: errorPrototypes.get(Object.getPrototypeOf(error)) ?? "Error" };
}

/** Explicit shallow projection. No traversal/toJSON/accessors of arbitrary payloads. */
export function projectLogMetadata(value: unknown): Record<string, unknown> {
  if (value instanceof Error) return { error: safeError(value) };
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, unknown> = {};
  for (const key of [...identifierKeys, ...codeKeys, ...metricKeys, "statusCode", "env", "error", "err"]) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) continue;
    const field = descriptor.value;
    if (identifierKeys.has(key) && typeof field === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(field)) result[key] = field;
    else if (codeKeys.has(key) && typeof field === "string" && /^[a-zA-Z][a-zA-Z0-9_.:-]{0,79}$/.test(field)) result[key] = field;
    else if (metricKeys.has(key) && typeof field === "number" && Number.isFinite(field) && field >= 0 && field <= Number.MAX_SAFE_INTEGER) result[key] = field;
    else if (key === "statusCode" && typeof field === "number" && Number.isInteger(field) && field >= 100 && field <= 599) result[key] = field;
    else if (key === "env" && ["development", "test", "production"].includes(field)) result[key] = field;
    else if ((key === "error" || key === "err") && field instanceof Error) result.error = safeError(field);
  }
  return result;
}

export class Logger {
  private readonly defaultContext: Record<string, unknown>;
  constructor(defaultContext: LogContext = {}) { this.defaultContext = projectLogMetadata(defaultContext); }
  withContext(context: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...projectLogMetadata(context) });
  }
  private log(level: LogLevel, message: string | object, data?: unknown) {
    // Fastify's error handler calls log(metadata, message); application code also
    // uses log(message, metadata). Both paths pass through the same projection.
    const text = typeof message === "string" ? message : typeof data === "string" ? data : "Structured log event";
    const metadata = typeof message === "string" ? data : message;
    const payload = {
      ...this.defaultContext,
      timestamp: new Date().toISOString(), level,
      // Callers must supply static messages; this is not PII detection in free text.
      message: text.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 300),
      ...(metadata === undefined ? {} : { data: projectLogMetadata(metadata) }),
    };
    console[level](JSON.stringify(payload));
  }
  info(message: string | object, data?: unknown) { this.log("info", message, data); }
  warn(message: string | object, data?: unknown) { this.log("warn", message, data); }
  error(message: string | object, data?: unknown) { this.log("error", message, data); }
  debug(message: string | object, data?: unknown) { this.log("debug", message, data); }
}
export const logger = new Logger();
