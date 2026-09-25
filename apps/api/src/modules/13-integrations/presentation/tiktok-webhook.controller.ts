import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { Database } from "../../00-shared/infrastructure/database.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";
import { syncLeadToCrm } from "../application/crm-sync.helper.js";
import crypto from "node:crypto";

export function tiktokWebhookRoutes(
  app: FastifyInstance,
  db: Database,
  gateway?: WebsocketGateway,
) {
  if (!app.hasContentTypeParser("application/x-www-form-urlencoded")) {
    app.addContentTypeParser(
      "application/x-www-form-urlencoded",
      { parseAs: "string" },
      (_req, body, done) => {
        try {
          const parsed = Object.fromEntries(new URLSearchParams(body as string));
          done(null, parsed);
        } catch (err: any) {
          done(err, null);
        }
      }
    );
  }

  // Verificação de Webhook do TikTok for Business (Challenge Handshake)
  app.get("/api/v1/webhooks/tiktok", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as Record<string, string>;
    const challenge = query["challenge"] || query["hub.challenge"] || query["echo_str"];

    if (challenge) {
      req.log.info("TikTok webhook challenge verified");
      return reply.status(200).send(challenge);
    }

    return reply.status(200).send({ status: "ok", service: "BipeSend TikTok Webhook" });
  });

  // Recebimento de Mensagens Diretas e Leads do TikTok
  app.post("/api/v1/webhooks/tiktok", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = (req.query || {}) as Record<string, string>;
    const queryChallenge = query["challenge"] || query["echo_str"] || query["hub.challenge"];
    if (queryChallenge) {
      return reply.status(200).send(queryChallenge);
    }

    const payload = req.body as any;

    if (!payload) {
      return reply.status(200).send({ received: false });
    }

    try {
      if (payload.event === "verify" || payload.challenge || payload.echo_str) {
        return reply.status(200).send(payload.challenge || payload.echo_str || payload.event);
      }

      const data = payload.data || payload.content || payload;
      const senderId = data.from_user_id || data.sender_id || data.user_id;
      const text = data.text || data.message || (typeof data === "string" ? data : "[Mensagem TikTok Direct]");
      const accountId = payload.client_key || payload.app_id || payload.business_id;

      if (!senderId) {
        return reply.status(200).send({ received: true });
      }

      // Localizar conexão do tenant
      const connections = await db.query(
        `SELECT tenant_id, instance_name FROM connections 
         WHERE provider = 'tiktok' 
         AND (
           metadata->>'clientKey' = $1 
           OR metadata->>'businessId' = $1
           OR instance_name LIKE $2
         )
         LIMIT 1`,
        [accountId, `%${accountId || ""}%`]
      );

      let tenantId = connections.length > 0 ? connections[0].tenant_id : null;
      let instanceName = connections.length > 0 ? connections[0].instance_name : "tiktok-default";

      if (!tenantId) {
        const fallback = await db.query("SELECT tenant_id, instance_name FROM connections WHERE provider = 'tiktok' LIMIT 1");
        if (fallback.length > 0) {
          tenantId = fallback[0].tenant_id;
          instanceName = fallback[0].instance_name;
        }
      }

      if (!tenantId) {
        req.log.warn("No tenant found for TikTok webhook");
        return reply.status(200).send({ received: true });
      }

      const contactName = `TikTok @${String(senderId).slice(-4)}`;

      const result = await db.withTransaction(async (tx) => {
        // 1. Contato
        const contacts = await tx.query(
          "SELECT id FROM contacts WHERE tenant_id = $1 AND (phone = $2 OR email = $3) LIMIT 1",
          [tenantId, `tt_${senderId}`, `${senderId}@tiktok.com`]
        );

        let contactId = "";
        if (contacts.length === 0) {
          contactId = crypto.randomUUID();
          await tx.query(
            `INSERT INTO contacts (id, tenant_id, name, phone, email, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [contactId, tenantId, contactName, `tt_${senderId}`, `${senderId}@tiktok.com`]
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
            `INSERT INTO conversations (id, tenant_id, contact_id, status, source, channel_reference, created_at, updated_at, last_activity_at) 
             VALUES ($1, $2, $3, 'open', 'tiktok', $4, NOW(), NOW(), NOW())`,
            [conversationId, tenantId, contactId, instanceName]
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
          [messageId, tenantId, conversationId, sequence, text, crypto.randomUUID()]
        );

        await tx.query(
          "UPDATE conversations SET last_activity_at = NOW() WHERE id = $1 AND tenant_id = $2",
          [conversationId, tenantId]
        );

        // 4. Sincronizar com CRM Kanban
        await syncLeadToCrm({
          db: tx as unknown as Database,
          gateway,
          tenantId,
          contactId,
          contactName,
          channel: "tiktok",
          previewText: text,
        });

        return { conversationId, tenantId };
      });

      if (result) {
        gateway?.broadcastToTenant(result.tenantId, "inbox.changed", { conversationId: result.conversationId });
      }

      return reply.status(200).send({ success: true });
    } catch (err) {
      req.log.error(err, "Failed to process TikTok webhook");
      return reply.status(200).send({ success: false });
    }
  });
}
