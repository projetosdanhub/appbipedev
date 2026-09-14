import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

export function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}
export function hashSecret(
  value: string,
  key: string,
  purpose: string,
): string {
  if (key.length < 32 || !purpose)
    throw new Error("Invalid secret configuration");
  return createHmac("sha256", key)
    .update(JSON.stringify([purpose, value]))
    .digest("hex");
}

/** AES-GCM envelope bound to tenant/provider through AAD. Key management stays in the server. */
export function encryptSecret(
  plaintext: string,
  key: Buffer,
  keyId: string,
  context: string,
): string {
  if (key.length !== 32 || !/^[a-zA-Z0-9_-]{1,64}$/.test(keyId) || !context)
    throw new Error("Invalid encryption configuration");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(JSON.stringify(["v1", keyId, context])));
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    keyId,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}
export function decryptSecret(
  envelope: string,
  keys: Readonly<Record<string, Buffer>>,
  context: string,
): string {
  const [version, keyId, iv, tag, ciphertext, extra] = envelope.split(".");
  if (
    version !== "v1" ||
    !keyId ||
    !iv ||
    !tag ||
    ciphertext === undefined ||
    extra !== undefined ||
    !context
  )
    throw new Error("Invalid secret envelope");
  const key = Object.hasOwn(keys, keyId) ? keys[keyId] : undefined;
  if (
    !key ||
    key.length !== 32 ||
    Buffer.from(iv, "base64url").length !== 12 ||
    Buffer.from(tag, "base64url").length !== 16
  )
    throw new Error("Invalid secret envelope");
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(iv, "base64url"),
    );
    decipher.setAAD(Buffer.from(JSON.stringify(["v1", keyId, context])));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Invalid secret envelope");
  }
}

/** Generic BipeSend internal envelope. Providers MUST use their own signing adapters. */
export function verifyWebhook(input: {
  rawBody: Buffer;
  signature: string;
  timestamp: string;
  secret: string;
  now?: number;
  toleranceSeconds?: number;
}): boolean {
  const {
    rawBody,
    signature,
    timestamp,
    secret,
    now = Date.now(),
    toleranceSeconds = 300,
  } = input;
  if (
    secret.length < 32 ||
    !/^\d{10}$/.test(timestamp) ||
    !/^[a-f0-9]{64}$/i.test(signature) ||
    toleranceSeconds < 1 ||
    toleranceSeconds > 300
  )
    return false;
  if (Math.abs(Math.floor(now / 1000) - Number(timestamp)) > toleranceSeconds)
    return false;
  const expected = createHmac("sha256", secret)
    .update(timestamp)
    .update(".")
    .update(rawBody)
    .digest("hex");
  return constantTimeEqual(signature.toLowerCase(), expected);
}

/** Only metadata explicitly approved for logging is retained. Free-text/error payloads are dropped. */
const logKeys = new Set([
  "requestId",
  "correlationId",
  "tenantId",
  "actorId",
  "code",
  "status",
  "durationMs",
  "method",
]);
export function redactLog(
  input: Record<string, unknown>,
): Record<string, string | number> {
  const output: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!logKeys.has(key)) continue;
    if (typeof value === "number" && Number.isFinite(value))
      output[key] = value;
    if (typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,100}$/.test(value))
      output[key] = value;
  }
  return output;
}
export function isAllowedOrigin(
  origin: string | null,
  allowedOrigins: readonly string[],
): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.origin === origin && allowedOrigins.includes(origin);
  } catch {
    return false;
  }
}

export interface RateLimitStore {
  increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; ttlMs: number }>;
}
export async function consumeRateLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number,
) {
  if (
    !key ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    !Number.isInteger(windowMs) ||
    windowMs < 1
  )
    throw new Error("Invalid rate limit");
  // Store failure propagates: the protected action must not proceed.
  const value = await store.increment(key, windowMs);
  return {
    allowed: value.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil(value.ttlMs / 1000)),
  };
}
export const rateLimitLua = `local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); ttl = tonumber(ARGV[1]) end
return {n, ttl}`;
