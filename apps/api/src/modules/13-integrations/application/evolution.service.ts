import type { Database } from "../../00-shared/infrastructure/database.js";
import { storageService } from "../../00-shared/infrastructure/storage.service.js";
import { env } from "../../../config/env.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";
import { syncLeadToCrm } from "./crm-sync.helper.js";
import type { CredentialsService } from "./credentials.service.js";
import crypto from "node:crypto";
import QRCode from "qrcode";

/** Cache em memória para evitar query ao BD a cada operação. */
interface CachedCredentials {
  url: string;
  apiKey: string;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60_000; // 60 segundos

export class EvolutionService {
  private _credCache: CachedCredentials | null = null;

  constructor(
    private readonly db: Database,
    private gateway?: WebsocketGateway,
    private credentialsService?: CredentialsService,
  ) {}

  /** Retorna credenciais do BD (via CredentialsService) com fallback para .env. Cache de 60s. */
  private async getCredentials(): Promise<{ url: string; apiKey: string }> {
    // Cache hit
    if (this._credCache && Date.now() - this._credCache.fetchedAt < CACHE_TTL_MS) {
      return this._credCache;
    }

    // Tenta BD primeiro (se CredentialsService disponível)
    if (this.credentialsService) {
      try {
        const creds = await this.credentialsService.getEvolutionCredentials();
        this._credCache = { ...creds, fetchedAt: Date.now() };
        return this._credCache;
      } catch {
        // Fallback silencioso
      }
    }

    // Fallback .env
    const key = process.env.EVOLUTION_API_KEY || env.EVOLUTION_API_KEY;
    const apiKey = (key && key !== "12345") ? key : "BipesendLocalDevApiKey123";
    const url = env.EVOLUTION_API_URL;
    this._credCache = { url, apiKey, fetchedAt: Date.now() };
    return this._credCache;
  }

  private async getApiKey(): Promise<string> {
    return (await this.getCredentials()).apiKey;
  }

  private async getApiUrl(): Promise<string> {
    return (await this.getCredentials()).url;
  }

  /**
   * Extrai o QR Code oficial gerado pelo motor Baileys da Evolution API.
   * Prioriza o base64 PNG nativo que vem perfeitamente formatado para o scanner do WhatsApp.
   * Se houver apenas o código raw de pareamento (2@...), gera via qrcode com nível 'L' (padrão WhatsApp).
   */
  private async extractStandardQrCode(data: any): Promise<string | null> {
    // 1. Prioriza o base64 nativo oficial emitido pelo Baileys
    const b64 = data?.base64 || data?.qrcode?.base64;
    if (b64 && typeof b64 === "string") {
      if (b64.startsWith("data:image/")) {
        return b64;
      }
      if (b64.length > 100) {
        return `data:image/png;base64,${b64}`;
      }
    }

    // 2. Se apenas o código raw estiver disponível, renderiza com nível 'L'
    const rawCode = data?.code || data?.qrcode?.code;
    if (rawCode && typeof rawCode === "string" && rawCode.trim().length > 10) {
      try {
        return await QRCode.toDataURL(rawCode.trim(), {
          width: 360,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "L",
        });
      } catch (err) {
        console.warn("[EvolutionService] Erro ao gerar QR Code padrão via QRCode.toDataURL:", err);
      }
    }

    return null;
  }

  async createInstance(tenantId: string, name: string) {
    const instanceName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() + "-" + tenantId.split("-")[0];
    
    // Verifica se conexão já existe
    const existing = await this.db.query(
      "SELECT id FROM connections WHERE tenant_id = $1 AND instance_name = $2 LIMIT 1",
      [tenantId, instanceName]
    );
    
    const webhookUrl = env.API_PUBLIC_URL 
      ? `${env.API_PUBLIC_URL}/api/v1/webhooks/evolution` 
      : "http://host.docker.internal:4000/api/v1/webhooks/evolution";
    
    const baseUrl = await this.getApiUrl();
    const url = `${baseUrl}/instance/create`;
    let qrcode: string | null = null;
    const apiKey = await this.getApiKey();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
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
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        const data = await response.json() as any;
        qrcode = await this.extractStandardQrCode(data);
      } else {
        const err = await response.text();
        console.warn(`[EvolutionService] Evolution API returned status ${response.status}: ${err}`);
      }
    } catch (_fetchErr) {
      console.warn(`[EvolutionService] Evolution API create call error at ${url}`);
    }

    // Se não veio QR code no create (instância criada ou já existente), busca via connect com polling
    if (!qrcode) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await new Promise((r) => setTimeout(r, attempt === 1 ? 800 : 1500));
          const connectUrl = `${baseUrl}/instance/connect/${instanceName}`;
          const connectRes = await fetch(connectUrl, {
            headers: { "apikey": apiKey },
            signal: AbortSignal.timeout(6000),
          });
          if (connectRes.ok) {
            const connectData = await connectRes.json() as any;
            qrcode = await this.extractStandardQrCode(connectData);
            if (qrcode) break;
          }
        } catch (_connectErr) {
          // Retry silencioso
        }
      }
    }
    
    const connectionId = crypto.randomUUID();
    
    if (existing.length === 0) {
      await this.db.query(
        "INSERT INTO connections (id, tenant_id, name, provider, instance_name, status, qrcode, created_at, updated_at) VALUES ($1, $2, $3, 'evolution_api', $4, 'connecting', $5, NOW(), NOW())",
        [connectionId, tenantId, name, instanceName, qrcode]
      );
    } else {
      await this.db.query(
        "UPDATE connections SET status = 'connecting', qrcode = COALESCE($1, qrcode), updated_at = NOW() WHERE tenant_id = $2 AND instance_name = $3",
        [qrcode, tenantId, instanceName]
      );
    }
    
    return {
      instanceName,
      qrcode
    };
  }

  async getQrCode(instanceName: string) {
    const apiKey = await this.getApiKey();
    const baseUrl = await this.getApiUrl();
    try {
      const url = `${baseUrl}/instance/connect/${instanceName}`;
      const response = await fetch(url, {
        headers: {
          "apikey": apiKey,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json() as any;
        let qrcode = await this.extractStandardQrCode(data);

        // Se o QR expirou ou atingiu contagem limite (ou code nulo), recria a instância na Evolution
        if (!qrcode && (data.count === undefined || data.count >= 3 || !data.code)) {
          console.log(`[EvolutionService] QR code expirado para ${instanceName}, recriando instância fresh...`);
          try {
            await fetch(`${baseUrl}/instance/delete/${instanceName}`, {
              method: "DELETE",
              headers: { "apikey": apiKey },
              signal: AbortSignal.timeout(5000),
            });
          } catch {}

          const createRes = await fetch(`${baseUrl}/instance/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": apiKey,
            },
            body: JSON.stringify({
              instanceName,
              token: instanceName,
              qrcode: true,
              integration: "WHATSAPP-BAILEYS",
              reject_call: true,
              events: ["MESSAGES_UPSERT", "CALL", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
            }),
            signal: AbortSignal.timeout(8000),
          });

          if (createRes.ok) {
            await new Promise((r) => setTimeout(r, 1500));
            const freshConnectRes = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
              headers: { "apikey": apiKey },
              signal: AbortSignal.timeout(6000),
            });
            if (freshConnectRes.ok) {
              const freshData = await freshConnectRes.json() as any;
              qrcode = await this.extractStandardQrCode(freshData);
            }
          }
        }

        if (qrcode) {
          await this.db.query(
            "UPDATE connections SET qrcode = $1, status = 'connecting', updated_at = NOW() WHERE instance_name = $2",
            [qrcode, instanceName]
          );
          return qrcode;
        }
      }
    } catch (err) {
      console.warn(`[EvolutionService] Não foi possível buscar QR code de ${instanceName}:`, err);
    }
    return null;
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
        if (isFromMe) return null;

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

      // 4. Sincroniza Lead com o CRM Kanban automaticamente
      if (!isFromMe) {
        await syncLeadToCrm({
          db: tx as unknown as Database,
          gateway: this.gateway,
          tenantId,
          contactId,
          contactName: pushName,
          channel: "whatsapp",
          previewText: text,
        });
      }
      
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
    try {
      const baseUrl = await this.getApiUrl();
      const url = `${baseUrl}/chat/rejectCall/${instanceName}`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": await this.getApiKey(),
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
      const baseUrl = await this.getApiUrl();
      const url = `${baseUrl}/message/sendText/${instanceName}`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": await this.getApiKey(),
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
    let qrcodeToSave: string | null = null;
    
    if (data.state === "open") {
      dbStatus = "connected";
    } else if (data.state === "connecting") {
      dbStatus = "connecting";
      // Se tiver qrcode no connection update
      qrcodeToSave = await this.extractStandardQrCode(data) || data.qrcode?.base64 || data.base64 || null;
    }
    
    await this.db.query(
      "UPDATE connections SET status = $1, qrcode = COALESCE($2, qrcode), updated_at = NOW() WHERE instance_name = $3",
      [dbStatus, qrcodeToSave, instanceName]
    );

    const connections = await this.db.query("SELECT tenant_id FROM connections WHERE instance_name = $1 LIMIT 1", [instanceName]);
    if (connections.length > 0) {
      this.gateway?.broadcastToTenant(connections[0].tenant_id, "connection.changed", { instanceName, status: dbStatus });
    }
  }

  async handleQrcodeUpdated(instanceName: string, data: any) {
    const qrcode = await this.extractStandardQrCode(data) || data.qrcode?.base64 || data.base64;
    if (!qrcode) return;

    await this.db.query(
      "UPDATE connections SET status = 'connecting', qrcode = $1, updated_at = NOW() WHERE instance_name = $2",
      [qrcode, instanceName]
    );

    const connections = await this.db.query("SELECT tenant_id FROM connections WHERE instance_name = $1 LIMIT 1", [instanceName]);
    if (connections.length > 0) {
      this.gateway?.broadcastToTenant(connections[0].tenant_id, "connection.qrcode", { instanceName, qrcode });
    }
  }

  async deleteInstance(tenantId: string, instanceName: string) {
    // Apaga na API do Evolution
    try {
      const baseUrl = await this.getApiUrl();
      const url = `${baseUrl}/instance/delete/${instanceName}`;
      await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": await this.getApiKey(),
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
