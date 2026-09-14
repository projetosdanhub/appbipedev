import { describe, it } from "node:test";
import * as assert from "node:assert";
import { Logger } from "../src/index.js";

describe("Logger", () => {
  it("should output valid JSON", () => {
    let lastLog = "";
    const originalInfo = console.info;
    console.info = (msg: string) => {
      lastLog = msg;
    };

    const logger = new Logger();
    logger.info("Hello world");

    console.info = originalInfo;

    const parsed = JSON.parse(lastLog);
    assert.strictEqual(parsed.message, "Hello world");
    assert.strictEqual(parsed.level, "info");
    assert.ok(parsed.timestamp);
  });

  it("should redact sensitive fields", () => {
    let lastLog = "";
    const originalError = console.error;
    console.error = (msg: string) => {
      lastLog = msg;
    };

    const logger = new Logger();
    logger.error("Login failed", {
      email: "user@example.com",
      password: "supersecret",
      nested: {
        token: "12345",
      },
    });

    console.error = originalError;

    const parsed = JSON.parse(lastLog);
    assert.strictEqual(parsed.data.email, "user@example.com");
    assert.strictEqual(parsed.data.password, "[REDACTED]");
    assert.strictEqual(parsed.data.nested.token, "[REDACTED]");
  });

  it("should include context fields", () => {
    let lastLog = "";
    const originalInfo = console.info;
    console.info = (msg: string) => {
      lastLog = msg;
    };

    const rootLogger = new Logger({ requestId: "req-123" });
    const reqLogger = rootLogger.withContext({ tenantId: "tenant-1" });
    
    reqLogger.info("Contextual log");

    console.info = originalInfo;

    const parsed = JSON.parse(lastLog);
    assert.strictEqual(parsed.requestId, "req-123");
    assert.strictEqual(parsed.tenantId, "tenant-1");
  });
});
