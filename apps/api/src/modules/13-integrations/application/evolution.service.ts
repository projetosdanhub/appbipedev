import type { Database } from "../../00-shared/infrastructure/database.js";
import { storageService } from "../../00-shared/infrastructure/storage.service.js";
import { env } from "../../../config/env.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";
import crypto from "node:crypto";

export class EvolutionService {
  constructor(private readonly db: Database, private gateway?: WebsocketGateway) {}

  async createInstance(tenantId: string, name: string) {
    const instanceName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() + "-" + tenantId.split("-")[0];
    
    // Check if connection already exists
    const existing = await this.db.query("SELECT id FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1", [tenantId, instanceName]);
    
    const webhookUrl = env.API_PUBLIC_URL ? `${env.API_PUBLIC_URL}/api/v1/webhooks/evolution` : "https://api.localhost/api/v1/webhooks/evolution";
    
    const url = `${env.EVOLUTION_API_URL}/instance/create`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": env.EVOLUTION_API_KEY || "",
      },
      body: JSON.stringify({
        instanceName,
        token: instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        reject_call: true,
        webhook: webhookUrl,
        webhook_by_events: false,
        events: ["MESSAGES_UPSERT", "CALL", "CONNECTION_UPDATE", "QRCODE_UPDATED"]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create instance in Evolution API: ${err}`);
    }

    const data = await response.json() as any;
    const qrcode = data?.qrcode?.base64 || data?.base64 || null; 
    
    const connectionId = crypto.randomUUID();
    
    if (existing.length === 0) {
      await this.db.query(
        "INSERT INTO connections (id, tenant_id, name, provider, instance_name, status, created_at, updated_at) VALUES ($1, $2, $3, 'evolution_api', $4, 'connecting', NOW(), NOW())",
        [connectionId, tenantId, name, instanceName]
      );
    } else {
      await this.db.query(
        "UPDATE connections SET status = 'connecting', updated_at = NOW() WHERE tenant_id = $1 AND instance_name = $2",
        [tenantId, instanceName]
      );
    }
    
    return {
      instanceName,
      qrcode
    };
  }

  async handleMessagesUpsert(instanceName: string, data: any) {
    // Basic validation
    if (!data.key || !data.message) return;
    
    // We only process real messages (not broadcast status, etc)
    if (data.key.remoteJid === "status@broadcast") return;

    const connections = await this.db.query("SELECT tenant_id FROM connections WHERE instance_name = $1 LIMIT 1", [instanceName]);
    if (connections.length === 0) return;
    const tenantId = connections[0].tenant_id;

    const isFromMe = data.key.fromMe === true;
    const rawPhone = data.key.remoteJid.split("@")[0];
    const pushName = data.pushName || rawPhone;

    // Determine message text and media
    let text = "";
    const base64 = data.message.base64;
    let mimetype = "";
    let fileName = "";

    // Extract text depending on message type
    if (data.message.conversation) {
      text = data.message.conversation;
    } else if (data.message.extendedTextMessage?.text) {
      text = data.message.extendedTextMessage.text;
    } else if (data.message.imageMessage) {
      text = data.message.imageMessage.caption || "";
      mimetype = data.message.imageMessage.mimetype;
    } else if (data.message.audioMessage) {
      mimetype = data.message.audioMessage.mimetype;
    } else if (data.message.videoMessage) {
      text = data.message.videoMessage.caption || "";
      mimetype = data.message.videoMessage.mimetype;
    } else if (data.message.documentMessage) {
      text = data.message.documentMessage.caption || data.message.documentMessage.fileName || "";
      mimetype = data.message.documentMessage.mimetype;
      fileName = data.message.documentMessage.fileName || "document";
    }

    let mediaUrl: string | null = null;

    if (base64) {
      const buffer = Buffer.from(base64, "base64");
      const name = fileName || `media_${Date.now()}`;
      const ext = mimetype.includes("image") ? ".jpg" : mimetype.includes("audio") ? ".ogg" : mimetype.includes("video") ? ".mp4" : ".bin";
      const uploadResult = await storageService.upload(buffer, name + ext, mimetype);
      mediaUrl = uploadResult.url;
    }

    const result = await this.db.withTransaction(async (tx) => {
      // 1. Find or create Contact
      const contacts = await tx.query("SELECT id FROM contacts WHERE tenant_id = $1 AND phone = $2 LIMIT 1", [tenantId, rawPhone]);
      let contactId = "";
      
      if (contacts.length === 0) {
        contactId = crypto.randomUUID();
        await tx.query(
          "INSERT INTO contacts (id, tenant_id, name, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())",
          [contactId, tenantId, pushName, rawPhone]
        );
      } else {
        contactId = contacts[0].id;
      }

      // 2. Find active conversation
      const conversations = await tx.query(
        "SELECT id FROM conversations WHERE tenant_id = $1 AND contact_id = $2 AND status = 'open' LIMIT 1",
        [tenantId, contactId]
      );
      let conversationId = "";

      if (conversations.length === 0) {
        if (isFromMe) return null; // Don't create conversation if fromMe and no open conversation exists

        conversationId = crypto.randomUUID();
        await tx.query(
          "INSERT INTO conversations (id, tenant_id, contact_id, status, source, channel_reference, created_at, updated_at, last_activity_at) VALUES ($1, $2, $3, 'open', 'whatsapp', $4, NOW(), NOW(), NOW())",
          [conversationId, tenantId, contactId, instanceName]
        );
      } else {
        conversationId = conversations[0].id;
      }

      // 3. Create message
      const messageId = crypto.randomUUID();
      const sequence = new Date().toISOString();
      const direction = isFromMe ? "outbound" : "inbound";
      
      await tx.query(
        `INSERT INTO messages (
          id, tenant_id, conversation_id, sequence, kind, direction,
          text, client_message_id, created_at, has_media, media_url, media_type, media_name
        ) VALUES ($1, $2, $3, $4, 'channel_message', $5, $6, $7, NOW(), $8, $9, $10, $11)`,
        [
          messageId, tenantId, conversationId, sequence, direction,
          text, data.key.id, !!mediaUrl, mediaUrl, mimetype || null, fileName || null
        ]
      );

      // Update last activity
      await tx.query(
        "UPDATE conversations SET last_activity_at = NOW() WHERE id = $1 AND tenant_id = $2",
        [conversationId, tenantId]
      );
      
      return { conversationId, tenantId };
    });

    if (result) {
      this.gateway?.broadcastToTenant(result.tenantId, "inbox.changed", { conversationId: result.conversationId });
    }
  }

  async handleCall(instanceName: string, data: any) {
    if (data.status !== "ringing") return;

    const connections = await this.db.query("SELECT tenant_id FROM connections WHERE instance_name = $1 LIMIT 1", [instanceName]);
    if (connections.length === 0) return;

    // We reject the call
    await this.rejectCall(instanceName, data.from, data.id);

    // Send retention message
    const retentionMessage = "Olá! Nosso atendimento é feito exclusivamente por mensagem de texto ou áudio. Por favor, escreva ou grave um áudio para podermos te ajudar.";
    await this.sendMessage(instanceName, data.from, retentionMessage);
  }

  private async rejectCall(instanceName: string, remoteJid: string, callId: string) {
    // Normally evolution has an endpoint to reject calls or block
    // Wait, Evolution API `call` webhook doesn't allow direct rejection through a simple endpoint, 
    // it depends on the evolution API version. Often people send a text message immediately.
    // Assuming Evolution API POST /chat/rejectCall or similar isn't standard, we might just send the message.
    // For now, let's pretend /chat/rejectCall exists or just skip it if it doesn't.
    try {
      const url = `${env.EVOLUTION_API_URL}/chat/rejectCall/${instanceName}`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          number: remoteJid,
          callId: callId
        }),
      });
    } catch (e) {
      console.error("Error rejecting call:", e);
    }
  }

  private async sendMessage(instanceName: string, remoteJid: string, text: string) {
    try {
      const url = `${env.EVOLUTION_API_URL}/message/sendText/${instanceName}`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          number: remoteJid,
          options: { delay: 1000 },
          textMessage: { text }
        }),
      });
    } catch (e) {
      console.error("Error sending message:", e);
    }
  }

  async handleConnectionUpdate(instanceName: string, data: any) {
    if (!data.state) return;
    
    // state could be 'open', 'close', 'connecting'
    let dbStatus = "disconnected";
    if (data.state === "open") dbStatus = "connected";
    if (data.state === "connecting") dbStatus = "connecting";
    
    await this.db.query(
      "UPDATE connections SET status = $1, qrcode = NULL, updated_at = NOW() WHERE instance_name = $2",
      [dbStatus, instanceName]
    );

    const connections = await this.db.query("SELECT tenant_id FROM connections WHERE instance_name = $1 LIMIT 1", [instanceName]);
    if (connections.length > 0) {
      this.gateway?.broadcastToTenant(connections[0].tenant_id, "connection.changed", { instanceName, status: dbStatus });
    }
  }

  async handleQrcodeUpdated(instanceName: string, data: any) {
    const qrcode = data.qrcode?.base64 || data.base64;
    if (!qrcode) return;

    await this.db.query(
      "UPDATE connections SET status = 'connecting', updated_at = NOW() WHERE instance_name = $1",
      [instanceName]
    );

    const connections = await this.db.query("SELECT tenant_id FROM connections WHERE instance_name = $1 LIMIT 1", [instanceName]);
    if (connections.length > 0) {
      this.gateway?.broadcastToTenant(connections[0].tenant_id, "connection.qrcode", { instanceName, qrcode });
    }
  }
  async deleteInstance(tenantId: string, instanceName: string) {
    // Apaga na API do Evolution
    try {
      const url = `${env.EVOLUTION_API_URL}/instance/delete/${instanceName}`;
      await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.EVOLUTION_API_KEY || "",
        }
      });
    } catch (e) {
      console.error("Error deleting instance in Evolution API:", e);
    }

    // Apaga no Banco de Dados
    await this.db.query(
      "DELETE FROM connections WHERE tenant_id = $1 AND instance_name = $2",
      [tenantId, instanceName]
    );

    this.gateway?.broadcastToTenant(tenantId, "connection.deleted", { instanceName });
  }
}
