import type { IMessagingProvider, SendMessagePayload } from "@bipesend/contracts";

export class FakeMessagingProvider implements IMessagingProvider {
  public sentMessages: { instanceName: string; remoteJid: string; payload: SendMessagePayload }[] = [];
  public connectionStatus: "connected" | "disconnected" | "connecting" = "connected";

  async sendMessage(instanceName: string, remoteJid: string, payload: SendMessagePayload): Promise<void> {
    this.sentMessages.push({ instanceName, remoteJid, payload });
  }

  async getConnectionStatus(_instanceName: string): Promise<"connected" | "disconnected" | "connecting"> {
    return this.connectionStatus;
  }
}
