import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import {
  constantTimeEqual,
  encryptSecret,
  decryptSecret,
  hashSecret,
  verifyWebhook,
  redactLog,
  consumeRateLimit,
} from "../src/index.ts";
test("compares malformed credentials without exceptions or prefix acceptance", () => {
  assert.equal(constantTimeEqual("short", "longer"), false);
  assert.equal(constantTimeEqual("bipesend_fake", "bipesend_real"), false);
});
test("ciphertext cannot be moved between tenants or tampered with", () => {
  const key = randomBytes(32),
    envelope = encryptSecret("provider-token", key, "k1", "tenant-a:provider");
  assert.equal(
    decryptSecret(envelope, { k1: key }, "tenant-a:provider"),
    "provider-token",
  );
  assert.throws(() =>
    decryptSecret(envelope, { k1: key }, "tenant-b:provider"),
  );
  assert.throws(() =>
    decryptSecret(
      envelope.replace(/.$/, "!"),
      { k1: key },
      "tenant-a:provider",
    ),
  );
  assert.throws(() => decryptSecret(envelope, {}, "tenant-a:provider"));
  assert.notEqual(
    hashSecret("123456", key.toString("hex"), "otp:a"),
    hashSecret("123456", key.toString("hex"), "otp:b"),
  );
});
test("signed raw bytes and timestamp must match; old/future/malformed signatures fail", () => {
  const secret = "a".repeat(32),
    rawBody = Buffer.from('{ "id": 1 }'),
    timestamp = "1789272000",
    now = Number(timestamp) * 1000;
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest("hex");
  assert.equal(
    verifyWebhook({ secret, rawBody, timestamp, signature, now }),
    true,
  );
  assert.equal(
    verifyWebhook({
      secret,
      rawBody: Buffer.from('{"id":1}'),
      timestamp,
      signature,
      now,
    }),
    false,
  );
  assert.equal(
    verifyWebhook({
      secret,
      rawBody,
      timestamp,
      signature,
      now: now + 301_000,
    }),
    false,
  );
  assert.equal(
    verifyWebhook({ secret, rawBody, timestamp, signature: "x", now }),
    false,
  );
});
test("logging drops arbitrary payloads and rate limiting fails closed", async () => {
  assert.deepEqual(
    redactLog({
      requestId: "req_123",
      password: "x",
      token: "x",
      message: "customer@example.com",
      error: new Error("DSN"),
    }),
    { requestId: "req_123" },
  );
  await assert.rejects(
    consumeRateLimit(
      {
        increment: async () => {
          throw new Error("store down");
        },
      },
      "key",
      2,
      1000,
    ),
  );
  assert.equal(
    (
      await consumeRateLimit(
        { increment: async () => ({ count: 3, ttlMs: 500 }) },
        "key",
        2,
        1000,
      )
    ).allowed,
    false,
  );
});
