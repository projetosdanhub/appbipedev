import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyCodeSchema,
  onboardingSchema,
} from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("validates a correct login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123456789",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates a correct registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Joǜo Silva",
      companyName: "Empresa do Joǜo",
      email: "joao@empresa.com",
      password: "Senh@Forte1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short name", () => {
    const result = registerSchema.safeParse({
      name: "Jo",
      companyName: "Empresa do Joǜo",
      email: "joao@empresa.com",
      password: "Senh@Forte1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = registerSchema.safeParse({
      name: "Joǜo",
      companyName: "Empresa do Joǜo",
      password: "Senh@Forte1",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("validates a correct email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("validates matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass123!",
      confirmPassword: "NewPass123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass123!",
      confirmPassword: "DifferentPass!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abc",
      confirmPassword: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("verifyCodeSchema", () => {
  it("validates a 6-char code", () => {
    const result = verifyCodeSchema.safeParse({
      code: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short code", () => {
    const result = verifyCodeSchema.safeParse({
      code: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty code", () => {
    const result = verifyCodeSchema.safeParse({
      code: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("validates valid workspace name and slug", () => {
    const result = onboardingSchema.safeParse({
      companyName: "Meu Workspace",
      slug: "meu-workspace",
    });
    expect(result.success).toBe(true);
  });

  it("rejects workspace name with less than 2 characters", () => {
    const result = onboardingSchema.safeParse({
      companyName: "A",
      slug: "workspace",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("workspace");
    }
  });

  it("rejects slug with invalid characters like uppercase or spaces", () => {
    const resultUppercase = onboardingSchema.safeParse({
      companyName: "Workspace",
      slug: "Meu-Workspace",
    });
    expect(resultUppercase.success).toBe(false);

    const resultSpaces = onboardingSchema.safeParse({
      companyName: "Workspace",
      slug: "meu workspace",
    });
    expect(resultSpaces.success).toBe(false);
  });

  it("rejects slug with less than 2 characters", () => {
    const result = onboardingSchema.safeParse({
      companyName: "Workspace",
      slug: "a",
    });
    expect(result.success).toBe(false);
  });
});

