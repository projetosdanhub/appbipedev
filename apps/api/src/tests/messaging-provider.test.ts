import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { EvolutionMessagingProvider } from "../modules/07-messaging/infrastructure/evolution-messaging.provider.js";
import { env } from "../config/env.js";

const originalFetch = global.fetch;

describe("EvolutionMessagingProvider", () => {
  let provider: EvolutionMessagingProvider;
  let fetchMock: any;

  beforeEach(() => {
    provider = new EvolutionMessagingProvider(50); // 50ms timeout for tests
    fetchMock = mock.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mock.restoreAll();
  });

  describe("sendMessage", () => {
    it("should send a text message successfully", async () => {
      fetchMock.mock.mockImplementationOnce(() => {
        return Promise.resolve({ ok: true });
      });

      await provider.sendMessage("test-instance", "1234567890", { text: "Hello" });

      const calls = fetchMock.mock.calls;
      assert.strictEqual(calls.length, 1);
      assert.strictEqual(calls[0].arguments[0], `${env.EVOLUTION_API_URL}/message/sendText/test-instance`);
      
      const options = calls[0].arguments[1];
      assert.strictEqual(options.method, "POST");
      assert.strictEqual(options.headers["apikey"], env.EVOLUTION_API_KEY || "");
      
      const body = JSON.parse(options.body);
      assert.strictEqual(body.number, "1234567890");
      assert.strictEqual(body.textMessage.text, "Hello");
    });

    it("should map HTTP errors properly", async () => {
      fetchMock.mock.mockImplementationOnce(() => {
        return Promise.resolve({
          ok: false,
          status: 400,
          text: () => Promise.resolve("Invalid number"),
        });
      });

      await assert.rejects(
        provider.sendMessage("test-instance", "123", { text: "Hello" }),
        /Evolution API Error \[400\]: Invalid number/
      );
    });

    it("should throw timeout error if fetch exceeds timeout", async () => {
      fetchMock.mock.mockImplementationOnce((url: string, options: any) => {
        return new Promise((resolve, reject) => {
          if (options?.signal) {
            options.signal.addEventListener("abort", () => {
              const err = new Error("AbortError");
              err.name = "AbortError";
              reject(err);
            });
          }
          setTimeout(() => resolve({ ok: true }), 100);
        });
      });

      await assert.rejects(
        provider.sendMessage("test-instance", "123", { text: "Hello" }),
        /Timeout after 50ms/
      );
    });
  });

  describe("getConnectionStatus", () => {
    it("should return connected when state is open", async () => {
      fetchMock.mock.mockImplementationOnce(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ instance: { state: "open" } }),
        });
      });

      const status = await provider.getConnectionStatus("test-instance");
      assert.strictEqual(status, "connected");
    });

    it("should return disconnected on 404", async () => {
      fetchMock.mock.mockImplementationOnce(() => {
        return Promise.resolve({
          ok: false,
          status: 404,
        });
      });

      const status = await provider.getConnectionStatus("test-instance");
      assert.strictEqual(status, "disconnected");
    });

    it("should return disconnected on fetch timeout/error", async () => {
      fetchMock.mock.mockImplementationOnce((url: string, options: any) => {
        return new Promise((resolve, reject) => {
          if (options?.signal) {
            options.signal.addEventListener("abort", () => {
              const err = new Error("AbortError");
              err.name = "AbortError";
              reject(err);
            });
          }
          setTimeout(() => resolve({ ok: true }), 100);
        });
      });

      const status = await provider.getConnectionStatus("test-instance");
      assert.strictEqual(status, "disconnected");
    });
  });
});
