import { test } from "node:test";
import assert from "node:assert/strict";
import { Logger, projectLogMetadata } from "../src/index.js";

test("keeps API consumer context, protects envelope and drops arbitrary nested data", (t) => {
  const spy = t.mock.method(console, "info", () => {});
  const payload: Record<string, unknown> = { count: 3, email: "synthetic@example.invalid", password: "synthetic-secret", nested: { token: "synthetic-token" } };
  payload.circular = payload;
  const root = new Logger({ requestId: "req-123", app: "api", env: "development", token: "synthetic-token", message: "overridden", level: "debug" });
  root.withContext({ tenantId: "tenant-1", password: "synthetic-secret" }).info("Operation completed", payload);
  const parsed = JSON.parse(spy.mock.calls[0]!.arguments[0]);
  assert.equal(parsed.message, "Operation completed");
  assert.equal(parsed.level, "info");
  assert.equal(parsed.requestId, "req-123");
  assert.equal(parsed.tenantId, "tenant-1");
  assert.equal(parsed.app, "api");
  assert.equal(parsed.env, "development");
  assert.deepEqual(parsed.data, { count: 3 });
  assert.doesNotMatch(JSON.stringify(parsed), /synthetic|overridden|password/);
  root.info("Parent unchanged");
  assert.equal(JSON.parse(spy.mock.calls[1]!.arguments[0]).tenantId, undefined);
});

test("Error excludes message/stack/cause, including defaultContext and nested errors", (t) => {
  const spy = t.mock.method(console, "error", () => {});
  const error = new TypeError("synthetic-secret", { cause: new Error("synthetic-cause") });
  new Logger({ error }).error("Operation failed", { error, code: "WEB_DOCUMENT_INVALID", cause: error });
  const output = spy.mock.calls[0]!.arguments[0];
  const parsed = JSON.parse(output);
  assert.deepEqual(parsed.data, { error: { name: "TypeError" }, code: "WEB_DOCUMENT_INVALID" });
  assert.deepEqual(parsed.error, { name: "TypeError" });
  assert.doesNotMatch(output, /synthetic|stack|cause/);
  assert.deepEqual(projectLogMetadata(error), { error: { name: "TypeError" } });
});

test("does not execute getters/toJSON or accept malformed metadata", () => {
  const hostile = { get count() { throw new Error("getter executed"); }, toJSON() { throw new Error("toJSON executed"); }, durationMs: Infinity, statusCode: 700, requestId: "contains\nnewline", env: "synthetic-secret" };
  assert.deepEqual(projectLogMetadata(hostile), {});
  assert.deepEqual(projectLogMetadata([hostile]), {});
});

test("supports the Fastify error handler's metadata-first signature without logging raw errors", (t) => {
  const spy = t.mock.method(console, "error", () => {});
  const logger = new Logger({ requestId: "req-123" });
  logger.error({ err: new Error("synthetic-secret"), code: "INTERNAL_ERROR", req: { body: "synthetic-body" } }, "Unhandled error");
  const parsed = JSON.parse(spy.mock.calls[0]!.arguments[0]);
  assert.equal(parsed.message, "Unhandled error");
  assert.deepEqual(parsed.data, { code: "INTERNAL_ERROR", error: { name: "Error" } });
  assert.doesNotMatch(JSON.stringify(parsed), /synthetic/);
});
