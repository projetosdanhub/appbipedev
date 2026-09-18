import { describe, it } from "node:test";
import assert from "node:assert";
import { ConnectionService } from "../modules/07-messaging/application/connection.service.js";

describe("ConnectionService", () => {
  it("should create a connection and return initial state", async () => {
    const mockDb = {
      query: async () => [],
    } as any;

    const mockEvolutionService = {
      createInstance: async () => ({
        instanceName: "test-instance",
        qrcode: "base64-string",
      }),
    } as any;

    const service = new ConnectionService(mockDb, mockEvolutionService);
    const result = await service.createConnection("tenant-1", "My Connection");

    assert.strictEqual(result.instanceName, "test-instance");
    assert.strictEqual(result.qrcode, "base64-string");
    assert.strictEqual(result.status, "connecting");
  });

  it("should return null if connection does not exist", async () => {
    const mockDb = {
      query: async () => [],
    } as any;

    const service = new ConnectionService(mockDb, {} as any);
    const result = await service.getConnection("tenant-1", "unknown");

    assert.strictEqual(result, null);
  });
});
