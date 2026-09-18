export interface SendMessagePayload {
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
}

export interface IMessagingProvider {
  /**
   * Sends a message to a remote participant via a specific instance/channel.
   * @param instanceName The name or token of the provider instance (e.g. WhatsApp connection).
   * @param remoteJid The remote phone number or ID to send the message to.
   * @param payload Text or media payload.
   */
  sendMessage(
    instanceName: string,
    remoteJid: string,
    payload: SendMessagePayload,
  ): Promise<void>;

  /**
   * Fetches the connection status of the given instance.
   * @param instanceName The name or token of the provider instance.
   */
  getConnectionStatus(
    instanceName: string,
  ): Promise<"connected" | "disconnected" | "connecting">;
}
