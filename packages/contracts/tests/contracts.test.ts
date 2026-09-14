import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emailSchema,
  otpSchema,
  passwordSchema,
  paginationSchema,
  tenantContextSchema,
  integrationHealthSchema,
} from "../src/index.ts";
test("normalizes email and validates one exact password/OTP policy", () => {
  assert.equal(
    emailSchema.parse("  PERSON@EXAMPLE.COM  "),
    "person@example.com",
  );
  for (const code of ["12345", "1234567", "12345x"])
    assert.equal(otpSchema.safeParse(code).success, false);
  assert.equal(otpSchema.parse("012345"), "012345");
  assert.equal(passwordSchema.safeParse("longwithoutSymbol").success, false);
  assert.equal(passwordSchema.safeParse("A".repeat(129) + "!").success, false);
});
test("rejects unbounded pagination, unscoped context and secret fields in health DTO", () => {
  assert.equal(paginationSchema.safeParse({ limit: 1000 }).success, false);
  assert.equal(
    tenantContextSchema.safeParse({ userId: "test" }).success,
    false,
  );
  assert.equal(
    integrationHealthSchema.safeParse({
      provider: "example",
      state: "connected",
      checkedAt: null,
      latencyMs: null,
      token: "secret",
    }).success,
    false,
  );
});
