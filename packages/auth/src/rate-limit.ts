import { Redis } from "ioredis";
import { consumeRateLimit, hashSecret, rateLimitLua } from "@bipesend/security";

let redis: Redis | undefined;
let connecting: Promise<void> | undefined;
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.includes("replace_with"))
    throw new Error("AUTH_UNAVAILABLE");
  return secret;
}
export async function checkAuthRateLimit(
  purpose: string,
  identity: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  if (!process.env.REDIS_URL) throw new Error("AUTH_UNAVAILABLE");
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      enableOfflineQueue: false,
    });
    redis.on("error", () => {
      /* Caller fails closed, without logging connection data. */
    });
    connecting = redis.connect().finally(() => {
      connecting = undefined;
    });
  }
  if (connecting) await connecting;
  const key = `auth-limit:${hashSecret(identity.toLowerCase(), authSecret(), purpose)}`;
  const result = await consumeRateLimit(
    {
      async increment(bucket, ttl) {
        const value = (await redis!.eval(rateLimitLua, 1, bucket, ttl)) as [
          number,
          number,
        ];
        return { count: value[0], ttlMs: value[1] };
      },
    },
    key,
    limit,
    windowMs,
  );
  if (!result.allowed) throw new Error("AUTH_RATE_LIMITED");
}
