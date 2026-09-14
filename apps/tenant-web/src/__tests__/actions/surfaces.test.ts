import { describe, it, expect, vi } from "vitest";
const state = vi.hoisted(() => ({
  user: {
    id: "user-id",
    isSuperadmin: false,
    twoFactorEnabled: false,
    updatedAt: new Date(1000),
  },
}));

vi.mock("next/server", () => ({}));
vi.mock("next/headers", () => ({}));

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));
vi.mock("@bipesend/db", () => ({
  prisma: { user: { findUnique: async () => state.user } },
}));
vi.mock("@bipesend/auth/rate-limit", () => ({
  authSecret: () => "tenant-test-secret-".repeat(3),
  checkAuthRateLimit: vi.fn(),
}));
vi.mock("../../../../../packages/auth/src/session", () => ({
  verifySession: async () => true,
  createSession: async () => "test-session",
}));
import { getSurfaceAuthConfig } from "../../../../../packages/auth/src/surface";
describe("Auth surface and revocation callbacks", () => {
  it("separates cookies, secrets and identity classes, and rechecks revocation", async () => {
    process.env.SUPERADMIN_AUTH_SECRET = "platform-test-secret-".repeat(3);
    const tenant = getSurfaceAuthConfig("tenant") as any;
    const platform = getSurfaceAuthConfig("platform") as any;
    expect(tenant.cookies.sessionToken.name).not.toBe(
      platform.cookies.sessionToken.name,
    );
    expect(tenant.secret).not.toBe(platform.secret);
    const jwt = { id: state.user.id, surface: "tenant", authVersion: 1000, sessionId: "test-session" };
    expect(await tenant.callbacks.jwt({ token: jwt })).toEqual(jwt);
    expect(await platform.callbacks.jwt({ token: jwt })).toBeNull();
    state.user.updatedAt = new Date(2000);
    expect(await tenant.callbacks.jwt({ token: jwt })).toBeNull();
    state.user.updatedAt = new Date(1000);
    state.user.isSuperadmin = true;
    expect(await tenant.callbacks.jwt({ token: jwt })).toBeNull();
    expect(
      await platform.callbacks.jwt({ token: { ...jwt, surface: "platform" } }),
    ).toBeNull();
    state.user.twoFactorEnabled = true;
    expect(
      await platform.callbacks.jwt({ token: { ...jwt, surface: "platform" } }),
    ).not.toBeNull();
  });
});
