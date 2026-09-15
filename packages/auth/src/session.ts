import { prisma } from "@bipesend/db";
import { randomBytes } from "node:crypto";
import { Redis } from "ioredis";

let redis: Redis | undefined;
let connecting: Promise<void> | undefined;

function getRedis(): Redis | undefined {
  if (!process.env.REDIS_URL) return undefined;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      enableOfflineQueue: false,
    });
    redis.on("error", () => {
      // Falha silenciosa: a aplicação deve continuar operando pelo fallback do Postgres
    });
    connecting = redis.connect().catch(() => {}).finally(() => {
      connecting = undefined;
    });
  }
  return redis;
}

export async function createSession(userId: string, rememberMe: boolean, surface: "tenant" | "platform" = "tenant", impersonatedBy?: string): Promise<string> {
  // 30 days if rememberMe, otherwise 1 day
  const ttlDays = rememberMe ? 30 : 1;
  const expires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const sessionToken = randomBytes(32).toString("hex");

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expires,
      surface,
      impersonatedBy,
    },
  });

  return session.id;
}

export async function verifySession(sessionId: string, surface: "tenant" | "platform" = "tenant"): Promise<boolean> {
  const r = getRedis();
  const cacheKey = `auth-session:${surface}:${sessionId}`;

  if (r) {
    try {
      if (connecting) await connecting;
      const cached = await r.get(cacheKey);
      if (cached === "valid") return true;
      if (cached === "invalid") return false;
    } catch {
      // Ignora erro do Redis e usa fallback
    }
  }

  // Fallback to PostgreSQL
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.expires < new Date() || session.surface !== surface) {
      // Se tiver Redis, cache o miss para evitar repetição (TTL curto, 5 min)
      if (r) {
        r.set(cacheKey, "invalid", "EX", 300).catch(() => {});
      }
      return false;
    }

    // Cache hit
    if (r) {
      // Sincroniza o TTL do Redis com a expiração real (com limite de segurança)
      const ttl = Math.max(1, Math.floor((session.expires.getTime() - Date.now()) / 1000));
      r.set(cacheKey, "valid", "EX", ttl).catch(() => {});
    }

    return true;
  } catch {
    return false;
  }
}

export async function revokeSession(sessionId: string, surface: "tenant" | "platform" = "tenant"): Promise<void> {
  const r = getRedis();
  const cacheKey = `auth-session:${surface}:${sessionId}`;

  if (r) {
    try {
      if (connecting) await connecting;
      await r.del(cacheKey);
    } catch {
      // Ignora erro
    }
  }

  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  } catch {
    // Pode já ter sido deletado
  }
}
