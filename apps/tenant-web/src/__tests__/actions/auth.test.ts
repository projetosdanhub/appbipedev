import { describe, it, expect, vi } from "vitest";

vi.mock("@bipesend/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type: string;
    constructor(message: string) {
      super(message);
      this.type = "CredentialsSignin";
    }
  }
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@bipesend/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findFirst: vi.fn().mockResolvedValue({
        identifier: "user@test.com",
        token: "123456",
        expires: new Date(Date.now() + 1000000)
      }),
      deleteMany: vi.fn(),
      create: vi.fn(),
    }
  }
}));

import {
  loginAction,
  registerAction,
  forgotPasswordAction,
  resetPasswordAction,
  verifyAction,
} from "@/app/(auth)/_actions/auth";

describe("Server Actions — Auth", () => {
  describe("loginAction", () => {
    it("returns success with a valid payload", async () => {
      const result = await loginAction({
        email: "user@test.com",
        password: "NewPass123!",
      });
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });
  });

  describe("registerAction", () => {
    it("returns success with a valid payload", async () => {
      const result = await registerAction({
        name: "João",
        companyName: "João Company",
        email: "joao@test.com",
        password: "NewPass123!",
      });
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });
  });

  describe("forgotPasswordAction", () => {
    it("returns success with a valid email", async () => {
      const result = await forgotPasswordAction({
        email: "user@test.com",
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain("e-mail");
    });
  });

  describe("resetPasswordAction", () => {
    it("returns success with matching passwords", async () => {
      const result = await resetPasswordAction({
        email: "user@test.com",
        code: "123456",
        password: "NewPass123!",
        confirmPassword: "NewPass123!",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("verifyAction", () => {
    it("returns success with a valid code", async () => {
      const result = await verifyAction({
        email: "user@test.com",
        code: "123456",
      });
      expect(result.success).toBe(true);
    });
  });
});
