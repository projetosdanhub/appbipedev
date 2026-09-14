import { test, describe } from "node:test";
import * as assert from "node:assert";
import { signInternalToken, verifyInternalToken } from "../src/internal.js";

const SECRET = "12345678901234567890123456789012";

describe("Internal JWT Security", () => {
  test("generates and verifies valid token", async () => {
    const token = await signInternalToken({ svc: "test" }, SECRET);
    const payload = await verifyInternalToken(token, SECRET);
    assert.strictEqual(payload.svc, "test");
    assert.strictEqual(payload.iss, "urn:bipesend:internal");
    assert.strictEqual(payload.aud, "urn:bipesend:api");
  });

  test("rejects token signed with wrong secret", async () => {
    const token = await signInternalToken({ svc: "test" }, "wrong_secret_1234567890123456789");
    await assert.rejects(
      async () => verifyInternalToken(token, SECRET),
      { name: "JWSSignatureVerificationFailed" }
    );
  });

  test("rejects expired token", async () => {
    // expiresIn set to something negative or very small wouldn't wait easily, 
    // but jose allows testing expiration. We can simulate it by signing a token with past date.
    // Testing expiration explicitly is standard in JOSE.
    const token = await signInternalToken({ svc: "test" }, SECRET, "-1s");
    await assert.rejects(
      async () => verifyInternalToken(token, SECRET),
      { name: "JWTExpired" }
    );
  });
});
