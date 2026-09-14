import { test } from "node:test";
import assert from "node:assert/strict";
import { parseApiEnv, parsePublicOrigin } from "../src/index.ts";
const env = {
  DATABASE_URL: "postgresql://user:secret@localhost/test",
  REDIS_URL: "redis://localhost",
  AUTH_SESSION_SECRET: "a".repeat(32),
  INTERNAL_API_KEY: "b".repeat(32),
};
test("requires independent explicit config and rejects partial integer ports", () => {
  assert.equal(parseApiEnv(env).API_PORT, 4000);
  for (const API_PORT of ["4000evil", "0", "65536", "3.14"])
    assert.throws(() => parseApiEnv({ ...env, API_PORT }));
  assert.throws(() => parseApiEnv({ ...env, INTERNAL_API_KEY: "" }));
  try {
    parseApiEnv({ ...env, DATABASE_URL: "SECRET-VALUE" });
  } catch (error) {
    assert.equal(String(error).includes("SECRET-VALUE"), false);
  }
});
test("production origins require HTTPS and forbid credentials, paths and fragments", () => {
  assert.equal(
    parsePublicOrigin("https://app.example.com", true),
    "https://app.example.com",
  );
  for (const value of [
    "http://app.example.com",
    "https://user:pass@app.example.com",
    "https://app.example.com/path",
    "https://app.example.com#x",
  ])
    assert.throws(() => parsePublicOrigin(value, true));
});
