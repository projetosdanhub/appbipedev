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
