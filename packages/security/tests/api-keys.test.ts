import { test, describe } from "node:test";
import * as assert from "node:assert";
import { generateApiKey, hashApiKey, verifyApiKey } from "../src/api-keys.js";

describe("API Keys Security", () => {
  test("generates key with prefix", () => {
    const { key, hash } = generateApiKey("bip_test");
    assert.ok(key.startsWith("bip_test_"));
  });

  test("verifies valid key against hash", () => {
    const { key, hash } = generateApiKey("bip_test");
    assert.strictEqual(verifyApiKey(key, hash), true);
  });

  test("rejects invalid key against hash", () => {
    const { key, hash } = generateApiKey("bip_test");
    const { key: otherKey } = generateApiKey("bip_test");
    assert.strictEqual(verifyApiKey(otherKey, hash), false);
    assert.strictEqual(verifyApiKey(key + "1", hash), false);
    assert.strictEqual(verifyApiKey(key.slice(0, -1), hash), false);
  });
});
