import { describe, it, expect, vi } from "vitest";
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
        password: "12345678",
        rememberMe: false,
      });
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });
  });

  describe("registerAction", () => {
    it("returns success with a valid payload", async () => {
      const result = await registerAction({
        name: "João",
        email: "joao@test.com",
        password: "12345678",
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
        password: "NewPass123!",
        confirmPassword: "NewPass123!",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("verifyAction", () => {
    it("returns success with a valid code", async () => {
      const result = await verifyAction({
        code: "123456",
      });
      expect(result.success).toBe(true);
    });
  });
});
