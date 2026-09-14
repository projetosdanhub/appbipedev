import { describe, it, expect, vi } from "vitest";
const state = vi.hoisted(() => ({
  user: {
    id: "user-id",
    isSuperadmin: false,
    twoFactorEnabled: false,
    updatedAt: new Date(1000),
  },
  factories: [] as Array<() => any>,
}));
vi.mock("next-auth", () => ({
  default: (factory: () => any) => {
    state.factories.push(factory);
    return {};
  },
}));
vi.mock("next-auth/providers/credentials", () => ({
  default: (options: unknown) => options,
}));
vi.mock("next-auth/providers/google", () => ({
  default: (options: unknown) => options,
}));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));
vi.mock("@bipesend/db", () => ({
  prisma: { user: { findUnique: async () => state.user } },
}));
vi.mock("@bipesend/auth/rate-limit", () => ({
  authSecret: () => "tenant-test-secret-".repeat(3),
  checkAuthRateLimit: vi.fn(),
}));
import { createSurfaceAuth } from "../../../../../packages/auth/src/surface";
describe("Auth surface and revocation callbacks", () => {
  it("separates cookies, secrets and identity classes, and rechecks revocation", async () => {
    process.env.SUPERADMIN_AUTH_SECRET = "platform-test-secret-".repeat(3);
    createSurfaceAuth("tenant");
    createSurfaceAuth("platform");
    const tenant = state.factories[0](),
      platform = state.factories[1]();
    expect(tenant.cookies.sessionToken.name).not.toBe(
      platform.cookies.sessionToken.name,
    );
    expect(tenant.secret).not.toBe(platform.secret);
    const jwt = { id: state.user.id, surface: "tenant", authVersion: 1000 };
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
