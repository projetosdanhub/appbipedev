// These tests execute recovery against a rollback-capable in-memory adapter.
// They do not certify PostgreSQL locking, migrations or deployed Redis.
import { beforeEach, describe, it, expect, vi } from "vitest";
import { hashSecret } from "@bipesend/security";
type Token = { identifier: string; token: string; expires: Date };
const state = vi.hoisted(() => ({
  tokens: [] as Token[],
  password: "old-hash",
  sessions: 2,
  failUpdate: false,
  superadmin: false,
}));
vi.mock("@bipesend/auth/rate-limit", () => ({
  authSecret: () => "test-only-secret-".repeat(3),
  checkAuthRateLimit: vi.fn(),
}));
vi.mock("argon2", () => ({ argon2id: 2, hash: async () => "new-argon-hash" }));
vi.mock("@bipesend/db", () => {
  const user = {
    findUnique: async ({ where }: { where: { email: string } }) =>
      where.email === "user@test.com"
        ? { id: "user-id", isSuperadmin: state.superadmin }
        : null,
    update: async () => {
      if (state.failUpdate) throw new Error("DB_FAILURE");
      state.password = "new-argon-hash";
    },
  };
  const tx = {
    user,
    session: {
      deleteMany: async () => {
        state.sessions = 0;
      },
    },
    verificationToken: {
      create: async ({ data }: { data: Token }) => {
        state.tokens.push(data);
      },
      deleteMany: async ({
        where,
      }: {
        where: {
          identifier: string | { in: string[] };
          token?: string;
          expires?: { gt: Date };
        };
      }) => {
        const matches = (t: Token) =>
          (typeof where.identifier === "string"
            ? t.identifier === where.identifier
            : where.identifier.in.includes(t.identifier)) &&
          (!where.token || t.token === where.token) &&
          (!where.expires || t.expires > where.expires.gt);
        const before = state.tokens.length;
        state.tokens = state.tokens.filter((t) => !matches(t));
        return { count: before - state.tokens.length };
      },
    },
  };
  return {
    prisma: {
      ...tx,
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
        const before = {
          tokens: [...state.tokens],
          password: state.password,
          sessions: state.sessions,
        };
        try {
          return await fn(tx);
        } catch (error) {
          Object.assign(state, before);
          throw error;
        }
      },
    },
  };
});
import {
  requestRecovery,
  verifyRecovery,
  redeemRecovery,
} from "@bipesend/auth/recovery";
const email = "user@test.com";
beforeEach(() => {
  Object.assign(state, {
    tokens: [],
    password: "old-hash",
    sessions: 2,
    failUpdate: false,
    superadmin: false,
  });
});
async function issue() {
  let code = "";
  await requestRecovery(email, async (_, value) => {
    code = value;
  });
  return code;
}
describe("Recovery state transitions", () => {
  it("stores a purpose-bound HMAC, never the delivered six-digit code", async () => {
    const code = await issue();
    expect(code).toMatch(/^\d{6}$/);
    expect(state.tokens[0].token).not.toBe(code);
    expect(state.tokens[0].token).toBe(
      hashSecret(code, "test-only-secret-".repeat(3), `otp:${email}`),
    );
  });
  it("rejects an expired, wrong-account or reused code", async () => {
    const code = await issue();
    await expect(verifyRecovery("other@test.com", code)).rejects.toThrow(
      "AUTH_CODE_INVALID",
    );
    state.tokens[0].expires = new Date(0);
    await expect(verifyRecovery(email, code)).rejects.toThrow(
      "AUTH_CODE_INVALID",
    );
    const fresh = await issue();
    await verifyRecovery(email, fresh);
    await expect(verifyRecovery(email, fresh)).rejects.toThrow(
      "AUTH_CODE_INVALID",
    );
  });
  it("rotates password, deletes sessions, and rejects a reused or other-account proof", async () => {
    const proof = await verifyRecovery(email, await issue());
    await expect(
      redeemRecovery("other@test.com", proof, "NewPass123!"),
    ).rejects.toThrow("AUTH_CODE_INVALID");
    await redeemRecovery(email, proof, "NewPass123!");
    expect(state.password).toBe("new-argon-hash");
    expect(state.sessions).toBe(0);
    await expect(redeemRecovery(email, proof, "NewPass123!")).rejects.toThrow(
      "AUTH_CODE_INVALID",
    );
  }, 10000);
  it("rolls proof consumption back if password persistence fails", async () => {
    const proof = await verifyRecovery(email, await issue());
    state.failUpdate = true;
    await expect(redeemRecovery(email, proof, "NewPass123!")).rejects.toThrow(
      "DB_FAILURE",
    );
    expect(state.sessions).toBe(2);
    expect(state.password).toBe("old-hash");
    state.failUpdate = false;
    await redeemRecovery(email, proof, "NewPass123!");
    expect(state.password).toBe("new-argon-hash");
  });
  it("does not deliver tenant recovery for a platform owner", async () => {
    state.superadmin = true;
    const send = vi.fn();
    await requestRecovery(email, send);
    expect(send).not.toHaveBeenCalled();
    expect(state.tokens).toHaveLength(0);
  });
});
