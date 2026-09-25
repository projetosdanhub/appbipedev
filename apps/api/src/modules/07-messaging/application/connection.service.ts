import type { Database } from "../../00-shared/infrastructure/database.js";
import type { EvolutionService } from "../../13-integrations/application/evolution.service.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";
import { syncLeadToCrm } from "../../13-integrations/application/crm-sync.helper.js";
import crypto from "node:crypto";

export class ConnectionService {
  constructor(
    private readonly db: Database,
    private readonly evolutionService: EvolutionService,
    private readonly gateway?: WebsocketGateway
  ) {}

  async createConnection(tenantId: string, name: string, provider: string = "evolution_api", metadata?: Record<string, unknown>) {
    if (provider === "instagram" || provider === "tiktok" || provider === "telegram") {
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || provider;
      const instanceName = `${provider}-${sanitizedName}-${tenantId.split("-")[0]}`;
      const connectionId = crypto.randomUUID();

      // Para Telegram, tenta registrar o webhook automaticamente se o token estiver presente
      if (provider === "telegram" && metadata?.botToken) {
        try {
          const { setTelegramWebhook } = await import("../../13-integrations/presentation/telegram-webhook.controller.js");
          const publicApiUrl = process.env.API_PUBLIC_URL || process.env.PUBLIC_URL || "https://api.bipesend.com.br";
          const webhookUrl = (metadata.webhookUrl as string) || `${publicApiUrl}/api/v1/webhooks/telegram`;
          await setTelegramWebhook(String(metadata.botToken), webhookUrl);
        } catch (whErr) {
          // Não interrompe criação caso falhe no sandbox/offline
        }
      }
      
      const existing = await this.db.query(
        "SELECT id FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1",
        [tenantId, instanceName]
      );
      
      if (existing.length === 0) {
        await this.db.query(
          "INSERT INTO connections (id, tenant_id, name, provider, instance_name, status, metadata, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'connected', $6, NOW(), NOW())",
          [connectionId, tenantId, name, provider, instanceName, JSON.stringify(metadata || {})]
        );
      } else {
        await this.db.query(
          "UPDATE connections SET name = $3, status = 'connected', metadata = $4, updated_at = NOW() WHERE tenant_id = $1 AND instance_name = $2",
          [tenantId, instanceName, name, JSON.stringify(metadata || {})]
        );
      }

      this.gateway?.broadcastToTenant(tenantId, "connection.changed", {
        instanceName,
        status: "connected",
        provider,
      });

      return {
        id: connectionId,
        name,
        provider,
        instanceName,
        status: "connected" as const
      };
    }

    const result = await this.evolutionService.createInstance(tenantId, name);
    return {
      instanceName: result.instanceName,
      qrcode: result.qrcode,
      status: 'connecting' as const
    };
  }

  async refreshQrCode(tenantId: string, instanceName: string) {
    let qrcode = await this.evolutionService.getQrCode(instanceName);
    if (!qrcode) {
      const conn = await this.getConnection(tenantId, instanceName);
      if (conn && conn.name) {
        const created = await this.evolutionService.createInstance(tenantId, conn.name);
        qrcode = created.qrcode;
      }
    }

    if (qrcode) {
      this.gateway?.broadcastToTenant(tenantId, "connection.qrcode", { instanceName, qrcode });
      return { success: true, qrcode };
    }

    // Se o Evolution não respondeu, busca o último QR armazenado no banco
    const conn = await this.getConnection(tenantId, instanceName);
    return { success: !!conn?.qrcode, qrcode: conn?.qrcode || null };
  }

  async getConnection(tenantId: string, instanceName: string) {
    const connections = await this.db.query(
      "SELECT id, name, provider, instance_name, status, phone, metadata, qrcode FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1",
      [tenantId, instanceName]
    );

    if (connections.length === 0) {
      return null;
    }

    return {
      id: connections[0].id,
      name: connections[0].name,
      provider: connections[0].provider || "evolution_api",
      instanceName: connections[0].instance_name,
      status: connections[0].status as 'connected' | 'disconnected' | 'connecting',
      phone: connections[0].phone,
      metadata: connections[0].metadata,
      qrcode: connections[0].qrcode,
    };
  }

  async listConnections(tenantId: string) {
    const connections = await this.db.query(
      "SELECT id, name, provider, instance_name, status, phone, metadata, qrcode, created_at FROM connections WHERE tenant_id = $1 ORDER BY created_at ASC",
      [tenantId]
    );

    return connections.map(conn => ({
      id: conn.id,
      name: conn.name,
      provider: conn.provider || "evolution_api",
      instanceName: conn.instance_name,
      status: conn.status as 'connected' | 'disconnected' | 'connecting',
      phone: conn.phone,
      metadata: conn.metadata,
      qrcode: conn.qrcode,
      created_at: conn.created_at,
    }));
  }

  async deleteConnection(tenantId: string, instanceName: string) {
    if (instanceName.startsWith("instagram-") || instanceName.startsWith("tiktok-")) {
      await this.db.query("DELETE FROM connections WHERE tenant_id = $1 AND instance_name = $2", [tenantId, instanceName]);
      this.gateway?.broadcastToTenant(tenantId, "connection.deleted", { instanceName });
      return;
    }
    await this.evolutionService.deleteInstance(tenantId, instanceName);
  }

  /**
   * Simula o recebimento de mensagem em desenvolvimento/testes locais para validar
   * todo o pipeline do Inbox e CRM sem necessidade de webhook real externo.
   */
  async simulateIncomingMessage(
    tenantId: string,
    channel: "whatsapp" | "instagram" | "tiktok" | "telegram",
    senderName: string,
    messageText: string
  ) {
    const phone = channel === "whatsapp" 
      ? `55119${Math.floor(10000000 + Math.random() * 90000000)}` 
      : `${channel}_${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await this.db.withTransaction(async (tx) => {
      // 1. Contato
      const contacts = await tx.query(
        "SELECT id FROM contacts WHERE tenant_id = $1 AND phone = $2 LIMIT 1",
        [tenantId, phone]
      );

      let contactId = "";
      if (contacts.length === 0) {
        contactId = crypto.randomUUID();
        await tx.query(
          "INSERT INTO contacts (id, tenant_id, name, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())",
          [contactId, tenantId, senderName, phone]
        );
      } else {
        contactId = contacts[0].id;
      }

      // 2. Conversa
      const conversations = await tx.query(
        "SELECT id FROM conversations WHERE tenant_id = $1 AND contact_id = $2 AND status = 'open' LIMIT 1",
        [tenantId, contactId]
      );

      let conversationId = "";
      if (conversations.length === 0) {
        conversationId = crypto.randomUUID();
        await tx.query(
          "INSERT INTO conversations (id, tenant_id, contact_id, status, source, channel_reference, created_at, updated_at, last_activity_at) VALUES ($1, $2, $3, 'open', $4, 'simulated-instance', NOW(), NOW(), NOW())",
          [conversationId, tenantId, contactId, channel]
        );
      } else {
        conversationId = conversations[0].id;
      }

      // 3. Mensagem
      const messageId = crypto.randomUUID();
      const sequence = new Date().toISOString();
      await tx.query(
        `INSERT INTO messages (
          id, tenant_id, conversation_id, sequence, kind, direction,
          text, client_message_id, created_at, has_media
        ) VALUES ($1, $2, $3, $4, 'channel_message', 'inbound', $5, $6, NOW(), false)`,
        [messageId, tenantId, conversationId, sequence, messageText, crypto.randomUUID()]
      );

      await tx.query(
        "UPDATE conversations SET last_activity_at = NOW() WHERE id = $1 AND tenant_id = $2",
        [conversationId, tenantId]
      );

      // 4. Sincroniza Lead com CRM
      await syncLeadToCrm({
        db: tx as unknown as Database,
        gateway: this.gateway,
        tenantId,
        contactId,
        contactName: senderName,
        channel,
        previewText: messageText,
      });

      return { conversationId, contactId, messageId };
    });

    this.gateway?.broadcastToTenant(tenantId, "inbox.changed", { conversationId: result.conversationId });

    return result;
  }
}
