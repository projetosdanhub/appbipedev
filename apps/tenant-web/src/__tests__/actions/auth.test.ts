import { beforeEach, describe, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  rateLimit: vi.fn(),
  request: vi.fn(),
  verify: vi.fn(),
  redeem: vi.fn(),
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  findUser: vi.fn(),
  createUser: vi.fn(),
  createTenant: vi.fn(),
  createMembership: vi.fn(),
}));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("@bipesend/auth", () => ({ signIn: mocks.signIn }));
vi.mock("@bipesend/auth/rate-limit", () => ({
  checkAuthRateLimit: mocks.rateLimit,
}));
vi.mock("@bipesend/auth/recovery", () => ({
  requestRecovery: mocks.request,
  verifyRecovery: mocks.verify,
  redeemRecovery: mocks.redeem,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.getCookie, set: mocks.setCookie }),
}));
vi.mock("@bipesend/db", () => ({
  prisma: { user: { findUnique: mocks.findUser, findFirst: mocks.findUser, create: mocks.createUser } },
  withTenantCreationTransaction: vi.fn(async (prisma, tenantId, cb) => cb({
    user: { create: mocks.createUser },
    tenant: { create: mocks.createTenant },
    membership: { create: mocks.createMembership },
  })),
}));
vi.mock("@/lib/mailer", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
}));
import {
  loginAction,
  registerAction,
  forgotPasswordAction,
  verifyAction,
  resetPasswordAction,
} from "@/app/(auth)/_actions/auth";
const payload = {
  email: "user@test.com",
  password: "NewPass123!",
  confirmPassword: "NewPass123!",
};
beforeEach(() => {
  vi.resetAllMocks();
});
describe("Auth server action boundaries", () => {
  it("validates before invoking credentials", async () => {
    expect(
      (await loginAction({ email: "invalid", password: "x" })).success,
    ).toBe(false);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it("passes valid credentials and makes an unremembered session a session cookie", async () => {
    mocks.getCookie.mockReturnValue({ value: "opaque-session" });
    expect((await loginAction(payload)).success).toBe(true);
    expect(mocks.setCookie).toHaveBeenCalledWith(
      "__Secure-bipesend.tenant.session-token",
      "opaque-session",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
    expect(mocks.setCookie.mock.calls[0][2]).not.toHaveProperty("maxAge");
  });
  it("fails closed when the registration rate limiter is unavailable", async () => {
    mocks.rateLimit.mockRejectedValue(new Error("redis://sensitive"));
    const result = await registerAction({
      ...payload,
      name: "João",
      companyName: "Empresa",
    });
    expect(result.success).toBe(false);
    expect(result.message).not.toContain("redis");
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
  it("prevents user enumeration on registration by returning generic success", async () => {
    mocks.findUser.mockResolvedValue({ id: "exists" });
    const result = await registerAction({
      ...payload,
      name: "João",
      companyName: "Empresa",
    });
    expect(result.success).toBe(true);
    expect(result.message).toContain("caixa de entrada");
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(mocks.createTenant).not.toHaveBeenCalled();
  });
  it("creates user on valid registration, but defers tenant creation to onboarding", async () => {
    mocks.findUser.mockResolvedValue(null);
    mocks.createUser.mockResolvedValue({ id: "user-123" });
    const result = await registerAction({
      ...payload,
      name: "João",
      companyName: "Empresa",
    });
    expect(result.success).toBe(true);
    expect(mocks.createUser).toHaveBeenCalled();
    expect(mocks.createTenant).not.toHaveBeenCalled();
    expect(mocks.createMembership).not.toHaveBeenCalled();
  });
  it("responds generically to recovery without exposing code or proof", async () => {
    const result = await forgotPasswordAction({ email: payload.email });
    expect(result.success).toBe(true);
    expect(result).not.toHaveProperty("token");
  });
  it("places recovery proof only in a restricted HttpOnly cookie", async () => {
    mocks.verify.mockResolvedValue("server-proof");
    const result = await verifyAction({ email: payload.email, code: "012345" });
    expect(result.success).toBe(true);
    expect(JSON.stringify(result)).not.toContain("server-proof");
    expect(mocks.setCookie).toHaveBeenCalledWith(
      "bipesend.tenant.recovery",
      "server-proof",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
        path: "/forgot-password",
        maxAge: 600,
      }),
    );
  });
  it("rejects a code supplied by the client without a server-issued cookie", async () => {
    expect(
      (await resetPasswordAction({ ...payload, code: "012345" })).success,
    ).toBe(false);
    expect(mocks.redeem).not.toHaveBeenCalled();
  });
  it("uses the cookie and expires it after a successful reset", async () => {
    mocks.getCookie.mockReturnValue({ value: "server-proof" });
    expect(
      (await resetPasswordAction({ ...payload, code: "forged-code" })).success,
    ).toBe(true);
    expect(mocks.redeem).toHaveBeenCalledWith(
      payload.email,
      "server-proof",
      payload.password,
    );
    expect(mocks.setCookie).toHaveBeenCalledWith(
      "bipesend.tenant.recovery",
      "",
      expect.objectContaining({ path: "/forgot-password", maxAge: 0 }),
    );
  });
});
