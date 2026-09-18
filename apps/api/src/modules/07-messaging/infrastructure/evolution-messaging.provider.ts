import type { IMessagingProvider, SendMessagePayload } from "@bipesend/contracts";
import { env } from "../../../config/env.js";

export class EvolutionMessagingProvider implements IMessagingProvider {
  constructor(private readonly timeoutMs: number = 5000) {}

  async sendMessage(instanceName: string, remoteJid: string, payload: SendMessagePayload): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${env.EVOLUTION_API_URL}/message/sendText/${instanceName}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          number: remoteJid,
          options: { delay: 1000 },
          textMessage: { text: payload.text || "" },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Evolution API Error [${response.status}]: ${errText}`);
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        throw new Error(`Timeout after ${this.timeoutMs}ms while sending message to ${remoteJid}`);
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getConnectionStatus(instanceName: string): Promise<"connected" | "disconnected" | "connecting"> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${env.EVOLUTION_API_URL}/instance/connectionState/${instanceName}`;
      const response = await fetch(url, {
        headers: {
          "apikey": env.EVOLUTION_API_KEY || "",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 404) return "disconnected"; // instance not found
        throw new Error(`Evolution API Error [${response.status}] checking connection state`);
      }

      const data = (await response.json()) as any;
      const state = data?.instance?.state;
      if (state === "open") return "connected";
      if (state === "connecting") return "connecting";
      return "disconnected";
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.warn(`Timeout after ${this.timeoutMs}ms while checking status of ${instanceName}`);
      }
      // Se não conseguir conectar na API, assume desconectado
      return "disconnected";
    } finally {
      clearTimeout(timeout);
    }
  }
}
