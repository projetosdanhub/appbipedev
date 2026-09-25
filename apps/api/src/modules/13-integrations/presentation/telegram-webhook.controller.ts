import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { Database } from "../../00-shared/infrastructure/database.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";
import { syncLeadToCrm } from "../application/crm-sync.helper.js";
import crypto from "node:crypto";

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      type: "private" | "group" | "supergroup" | "channel";
    };
    date: number;
    text?: string;
    caption?: string;
    photo?: Array<{ file_id: string }>;
    document?: { file_id: string; file_name?: string };
    voice?: { file_id: string; duration: number };
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      chat: { id: number };
      message_id: number;
    };
    data?: string;
  };
}

/**
 * Envia mensagem de texto via Telegram Bot API
 */
export async function sendTelegramMessage(botToken: string, chatId: number | string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Erro ao enviar mensagem Telegram:", err);
    throw err;
  }
}

/**
 * Configura o Webhook na API oficial do Telegram
 */
export async function setTelegramWebhook(botToken: string, webhookUrl: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Erro ao registrar webhook no Telegram:", err);
    throw err;
  }
}

export function telegramWebhookRoutes(
  app: FastifyInstance,
  db: Database,
  gateway?: WebsocketGateway,
) {
  // Verificação de status do Webhook Telegram
  app.get("/api/v1/webhooks/telegram", async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: "operational",
      service: "BipeSend Telegram Bot API Webhook",
      timestamp: new Date().toISOString(),
    });
  });

  // Recebimento de mensagens e eventos do Telegram Bot API
  app.post("/api/v1/webhooks/telegram", async (req: FastifyRequest, reply: FastifyReply) => {
    const payload = req.body as TelegramUpdate;
    if (!payload || (!payload.message && !payload.callback_query)) {
      return reply.status(200).send({ received: true });
    }

    try {
      const msg = payload.message || (payload.callback_query?.message as any);
      if (!msg) {
        return reply.status(200).send({ received: true });
      }

      const sender = payload.message?.from || payload.callback_query?.from;
      const chatId = msg.chat?.id || sender?.id;
      const text = payload.message?.text || payload.message?.caption || payload.callback_query?.data || "[Mensagem do Telegram]";

      if (!chatId || !sender) {
        return reply.status(200).send({ received: true });
      }

      // Localizar a conexão do tenant no banco
      const connections = await db.query(
        "SELECT id, tenant_id, instance_name, metadata FROM connections WHERE provider = 'telegram' AND status = 'connected' LIMIT 1"
      );

      let tenantId: string | null = null;
      let instanceName = "telegram-bot";

      if (connections.length > 0) {
        tenantId = connections[0].tenant_id;
        instanceName = connections[0].instance_name;
      } else {
        const fallback = await db.query("SELECT id, tenant_id, instance_name FROM connections WHERE provider = 'telegram' LIMIT 1");
        if (fallback.length > 0) {
          tenantId = fallback[0].tenant_id;
          instanceName = fallback[0].instance_name;
        }
      }

      if (!tenantId) {
        req.log.warn("Nenhum tenant encontrado para o webhook do Telegram");
        return reply.status(200).send({ received: true });
      }

      const rawFullName = [sender.first_name, sender.last_name].filter(Boolean).join(" ");
      const usernameTag = sender.username ? ` (@${sender.username})` : "";
      const contactName = `${rawFullName || "Usuário Telegram"}${usernameTag}`;
      const contactPhone = `tg_${chatId}`;
      const contactEmail = sender.username ? `${sender.username}@telegram.org` : `tg_${chatId}@telegram.org`;

      const result = await db.withTransaction(async (tx) => {
        // 1. Contato unificado no CRM
        const contacts = await tx.query(
          "SELECT id FROM contacts WHERE tenant_id = $1 AND (phone = $2 OR email = $3) LIMIT 1",
          [tenantId, contactPhone, contactEmail]
        );

        let contactId = "";
        if (contacts.length === 0) {
          contactId = crypto.randomUUID();
          await tx.query(
            `INSERT INTO contacts (id, tenant_id, name, phone, email, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [contactId, tenantId, contactName, contactPhone, contactEmail]
          );
        } else {
          contactId = contacts[0].id;
          // Atualiza nome caso tenha mudado no Telegram
          await tx.query(
            "UPDATE contacts SET name = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3",
            [contactName, contactId, tenantId]
          );
        }

        // 2. Conversa unificada no Inbox
        const conversations = await tx.query(
          "SELECT id FROM conversations WHERE tenant_id = $1 AND contact_id = $2 AND status = 'open' LIMIT 1",
          [tenantId, contactId]
        );

        let conversationId = "";
        if (conversations.length === 0) {
          conversationId = crypto.randomUUID();
          await tx.query(
            `INSERT INTO conversations (id, tenant_id, contact_id, status, source, channel_reference, created_at, updated_at, last_activity_at) 
             VALUES ($1, $2, $3, 'open', 'telegram', $4, NOW(), NOW(), NOW())`,
            [conversationId, tenantId, contactId, instanceName]
          );
        } else {
          conversationId = conversations[0].id;
        }

        // 3. Mensagem no Inbox
        const messageId = crypto.randomUUID();
        const sequence = new Date().toISOString();
        await tx.query(
          `INSERT INTO messages (
            id, tenant_id, conversation_id, sequence, kind, direction,
            text, client_message_id, created_at, has_media
          ) VALUES ($1, $2, $3, $4, 'channel_message', 'inbound', $5, $6, NOW(), false)`,
          [messageId, tenantId, conversationId, sequence, text, crypto.randomUUID()]
        );

        await tx.query(
          "UPDATE conversations SET last_activity_at = NOW() WHERE id = $1 AND tenant_id = $2",
          [conversationId, tenantId]
        );

        // 4. Sincronizar oportunidade no Funil Principal do CRM Kanban
        await syncLeadToCrm({
          db: tx as unknown as Database,
          gateway,
          tenantId,
          contactId,
          contactName,
          channel: "telegram",
          previewText: text,
        });

        return { conversationId, tenantId };
      });

      if (result) {
        gateway?.broadcastToTenant(result.tenantId, "inbox.changed", { conversationId: result.conversationId });
        gateway?.broadcastToTenant(result.tenantId, "message.received", {
          conversationId: result.conversationId,
          text,
          channel: "telegram",
          sender: contactName,
        });
      }

      return reply.status(200).send({ success: true });
    } catch (err) {
      req.log.error(err, "Falha ao processar webhook do Telegram");
      return reply.status(200).send({ success: false });
    }
  });

  // Rota com identificador de conexão no caminho (ex: /webhooks/telegram/:connectionId)
  app.post("/api/v1/webhooks/telegram/:instanceName", async (req: FastifyRequest, reply: FastifyReply) => {
    const params = req.params as { instanceName: string };
    const payload = req.body as TelegramUpdate;
    if (!payload || (!payload.message && !payload.callback_query)) {
      return reply.status(200).send({ received: true });
    }

    try {
      const msg = payload.message || (payload.callback_query?.message as any);
      if (!msg) return reply.status(200).send({ received: true });

      const sender = payload.message?.from || payload.callback_query?.from;
      const chatId = msg.chat?.id || sender?.id;
      const text = payload.message?.text || payload.message?.caption || payload.callback_query?.data || "[Mensagem do Telegram]";

      if (!chatId || !sender) return reply.status(200).send({ received: true });

      const connections = await db.query(
        "SELECT id, tenant_id, instance_name FROM connections WHERE instance_name = $1 LIMIT 1",
        [params.instanceName]
      );

      if (connections.length === 0) {
        req.log.warn(`Nenhuma conexão encontrada para ${params.instanceName}`);
        return reply.status(200).send({ received: true });
      }

      const tenantId = connections[0].tenant_id;
      const instanceName = connections[0].instance_name;

      const rawFullName = [sender.first_name, sender.last_name].filter(Boolean).join(" ");
      const usernameTag = sender.username ? ` (@${sender.username})` : "";
      const contactName = `${rawFullName || "Usuário Telegram"}${usernameTag}`;
      const contactPhone = `tg_${chatId}`;
      const contactEmail = sender.username ? `${sender.username}@telegram.org` : `tg_${chatId}@telegram.org`;

      const result = await db.withTransaction(async (tx) => {
        const contacts = await tx.query(
          "SELECT id FROM contacts WHERE tenant_id = $1 AND (phone = $2 OR email = $3) LIMIT 1",
          [tenantId, contactPhone, contactEmail]
        );

        let contactId = "";
        if (contacts.length === 0) {
          contactId = crypto.randomUUID();
          await tx.query(
            `INSERT INTO contacts (id, tenant_id, name, phone, email, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [contactId, tenantId, contactName, contactPhone, contactEmail]
          );
        } else {
          contactId = contacts[0].id;
          await tx.query(
            "UPDATE contacts SET name = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3",
            [contactName, contactId, tenantId]
          );
        }

        const conversations = await tx.query(
          "SELECT id FROM conversations WHERE tenant_id = $1 AND contact_id = $2 AND status = 'open' LIMIT 1",
          [tenantId, contactId]
        );

        let conversationId = "";
        if (conversations.length === 0) {
          conversationId = crypto.randomUUID();
          await tx.query(
            `INSERT INTO conversations (id, tenant_id, contact_id, status, source, channel_reference, created_at, updated_at, last_activity_at) 
             VALUES ($1, $2, $3, 'open', 'telegram', $4, NOW(), NOW(), NOW())`,
            [conversationId, tenantId, contactId, instanceName]
          );
        } else {
          conversationId = conversations[0].id;
        }

        const messageId = crypto.randomUUID();
        const sequence = new Date().toISOString();
        await tx.query(
          `INSERT INTO messages (
            id, tenant_id, conversation_id, sequence, kind, direction,
            text, client_message_id, created_at, has_media
          ) VALUES ($1, $2, $3, $4, 'channel_message', 'inbound', $5, $6, NOW(), false)`,
          [messageId, tenantId, conversationId, sequence, text, crypto.randomUUID()]
        );

        await tx.query(
          "UPDATE conversations SET last_activity_at = NOW() WHERE id = $1 AND tenant_id = $2",
          [conversationId, tenantId]
        );

        await syncLeadToCrm({
          db: tx as unknown as Database,
          gateway,
          tenantId,
          contactId,
          contactName,
          channel: "telegram",
          previewText: text,
        });

        return { conversationId, tenantId };
      });

      if (result) {
        gateway?.broadcastToTenant(result.tenantId, "inbox.changed", { conversationId: result.conversationId });
      }

      return reply.status(200).send({ success: true });
    } catch (err) {
      req.log.error(err, "Falha ao processar webhook do Telegram");
      return reply.status(200).send({ success: false });
    }
  });
}
