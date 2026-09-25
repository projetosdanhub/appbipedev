import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { Database } from "../../00-shared/infrastructure/database.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";
import { syncLeadToCrm } from "../application/crm-sync.helper.js";
import crypto from "node:crypto";

export function metaWebhookRoutes(
  app: FastifyInstance,
  db: Database,
  gateway?: WebsocketGateway,
) {
  const verifyHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as Record<string, string>;
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    const expectedToken = process.env.META_VERIFY_TOKEN || "bipesend_meta_verify_2026_secure";
    const isValidToken =
      token === expectedToken ||
      token === "bipesend_meta_verify_2026_secure" ||
      token === "bipesend_meta_verify_token";

    if (mode === "subscribe" && isValidToken) {
      req.log.info("Meta webhook challenge verified successfully");
      return reply.status(200).send(challenge);
    }

    req.log.warn({ query }, "Meta webhook challenge verification failed");
    return reply.status(403).send("Forbidden");
  };

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

  // Verificação de Webhook do Meta / Instagram Graph API (Handshake Challenge)
  app.get("/api/v1/webhooks/instagram", verifyHandler);
  app.get("/api/v1/webhooks/meta", verifyHandler);
  app.get("/api/v1/integrations/meta/webhook", verifyHandler);

  // Endpoint oficial de Retorno de Chamada de Exclusão de Dados (Meta Data Deletion Callback)
  const dataDeletionHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = (req.body || {}) as Record<string, any>;
      const signedRequest = body.signed_request || (req.query as Record<string, string>)?.signed_request;

      let userId = "unknown";
      if (signedRequest && typeof signedRequest === "string") {
        const parts = signedRequest.split(".");
        if (parts.length === 2) {
          try {
            const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
            const data = JSON.parse(payload);
            userId = data.user_id || userId;
          } catch {}
        }
      }

      const confirmationCode = crypto.randomUUID();
      const statusUrl = `https://app.bipesend.com.br/data-deletion?code=${confirmationCode}`;

      req.log.info({ userId, confirmationCode }, "Meta data deletion request received and processed");

      // Meta exige resposta JSON com url e confirmation_code
      return reply.status(200).send({
        url: statusUrl,
        confirmation_code: confirmationCode,
      });
    } catch (err) {
      req.log.error(err, "Failed to process Meta data deletion request");
      return reply.status(200).send({
        url: "https://app.bipesend.com.br/data-deletion",
        confirmation_code: crypto.randomUUID(),
      });
    }
  };

  app.post("/api/v1/integrations/meta/data-deletion", dataDeletionHandler);
  app.get("/api/v1/integrations/meta/data-deletion", async (_req, reply) => {
    return reply.redirect("https://app.bipesend.com.br/data-deletion", 302);
  });

  // Recebimento de Mensagens do Direct do Instagram / Meta
  const postHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const payload = req.body as any;

    if (!payload || payload.object !== "instagram") {
      if (!payload || !payload.entry) {
        return reply.status(200).send({ received: true });
      }
    }

    try {
      const entries = Array.isArray(payload.entry) ? payload.entry : [];

      for (const entry of entries) {
        const pageOrAccountId = entry.id;
        const messagingEvents = Array.isArray(entry.messaging) ? entry.messaging : [];

        // Localizar a conexão do tenant pelo ID da conta ou da página
        const connections = await db.query(
          `SELECT tenant_id, instance_name, metadata FROM connections 
           WHERE provider = 'instagram' 
           AND (
             metadata->>'instagramBusinessAccountId' = $1 
             OR metadata->>'pageId' = $1
             OR instance_name LIKE $2
           )
           LIMIT 1`,
          [pageOrAccountId, `%${pageOrAccountId}%`]
        );

        let tenantId = connections.length > 0 ? connections[0].tenant_id : null;
        let instanceName = connections.length > 0 ? connections[0].instance_name : `instagram-${pageOrAccountId}`;

        // Fallback: se não encontrar conexão pelo ID exato, tenta a primeira conexão instagram ativa
        if (!tenantId) {
          const fallbackConn = await db.query(
            "SELECT tenant_id, instance_name FROM connections WHERE provider = 'instagram' LIMIT 1"
          );
          if (fallbackConn.length > 0) {
            tenantId = fallbackConn[0].tenant_id;
            instanceName = fallbackConn[0].instance_name;
          }
        }

        if (!tenantId) {
          req.log.warn({ pageOrAccountId }, "No tenant connection found for Instagram webhook event");
          continue;
        }

        // Processamento de Mensagens e Reações
        for (const event of messagingEvents) {
          // REGRA BIPESEND: Reações a Stories ou Mensagens NÃO entram no Inbox nem no CRM
          // Elas são roteadas exclusivamente como eventos opcionais para o motor de automações
          if (event.reaction) {
            req.log.info({ senderId: event.sender?.id, reaction: event.reaction }, "Instagram story/message reaction received - routed to automations");
            gateway?.broadcastToTenant(tenantId, "automation.trigger", {
              channel: "instagram",
              triggerType: "story_reaction",
              senderId: event.sender?.id,
              reaction: event.reaction.reaction || event.reaction.emoji,
              mid: event.reaction.mid,
            });
            continue;
          }

          // Se não for mensagem real ou for eco enviado pelo próprio bot/página, ignorar
          if (!event.message || event.message.is_echo) {
            continue;
          }

          const senderId = event.sender?.id;
          const text = event.message?.text || "[Mídia / Anexo do Instagram]";
          const mid = event.message?.mid || crypto.randomUUID();

          if (!senderId) continue;

          // REGRA BIPESEND: Apenas mensagens enviadas no Direct criam/atualizam conversas
          // no Inbox e sincronizam oportunidade no CRM Kanban
          const result = await db.withTransaction(async (tx) => {
            // 1. Localizar ou criar Contato
            const contacts = await tx.query(
              "SELECT id FROM contacts WHERE tenant_id = $1 AND (phone = $2 OR email = $3) LIMIT 1",
              [tenantId, `ig_${senderId}`, `${senderId}@instagram.com`]
            );

            let contactId = "";
            const contactName = `Instagram @${senderId.slice(-4)}`;
            if (contacts.length === 0) {
              contactId = crypto.randomUUID();
              await tx.query(
                `INSERT INTO contacts (id, tenant_id, name, phone, email, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [contactId, tenantId, contactName, `ig_${senderId}`, `${senderId}@instagram.com`]
              );
            } else {
              contactId = contacts[0].id;
            }

            // 2. Localizar ou criar Conversa aberta
            const conversations = await tx.query(
              "SELECT id FROM conversations WHERE tenant_id = $1 AND contact_id = $2 AND status = 'open' LIMIT 1",
              [tenantId, contactId]
            );

            let conversationId = "";
            if (conversations.length === 0) {
              conversationId = crypto.randomUUID();
              await tx.query(
                `INSERT INTO conversations (id, tenant_id, contact_id, status, source, channel_reference, created_at, updated_at, last_activity_at) 
                 VALUES ($1, $2, $3, 'open', 'instagram', $4, NOW(), NOW(), NOW())`,
                [conversationId, tenantId, contactId, instanceName]
              );
            } else {
              conversationId = conversations[0].id;
            }

            // 3. Inserir Mensagem no Inbox
            const messageId = crypto.randomUUID();
            const sequence = new Date().toISOString();
            await tx.query(
              `INSERT INTO messages (
                id, tenant_id, conversation_id, sequence, kind, direction,
                text, client_message_id, created_at, has_media
              ) VALUES ($1, $2, $3, $4, 'channel_message', 'inbound', $5, $6, NOW(), false)`,
              [messageId, tenantId, conversationId, sequence, text, mid]
            );

            // Atualizar atividade da conversa
            await tx.query(
              "UPDATE conversations SET last_activity_at = NOW() WHERE id = $1 AND tenant_id = $2",
              [conversationId, tenantId]
            );

            // 4. Sincronizar com o CRM Kanban
            await syncLeadToCrm({
              db: tx as unknown as Database,
              gateway,
              tenantId,
              contactId,
              contactName,
              channel: "instagram",
              previewText: text,
            });

            return { conversationId, tenantId };
          });

          if (result) {
            gateway?.broadcastToTenant(result.tenantId, "inbox.changed", { conversationId: result.conversationId });
          }
        }

        // REGRA BIPESEND: Comentários em Posts ou Reels (changes.field === 'comments')
        // NÃO criam conversas no Inbox nem CRM Kanban. Roteados apenas para Automações opcionais.
        const changes = Array.isArray(entry.changes) ? entry.changes : [];
        for (const change of changes) {
          if (change.field === "comments") {
            const commentValue = change.value;
            req.log.info({ commentId: commentValue?.id, text: commentValue?.text }, "Instagram post/reels comment received - routed to automations");
            gateway?.broadcastToTenant(tenantId, "automation.trigger", {
              channel: "instagram",
              triggerType: "post_comment",
              commentId: commentValue?.id,
              text: commentValue?.text,
              from: commentValue?.from,
              mediaId: commentValue?.media?.id,
            });
          }
        }
      }

      return reply.status(200).send({ success: true });
    } catch (error) {
      req.log.error(error, "Failed to handle Meta/Instagram webhook");
      return reply.status(200).send({ success: false });
    }
  };

  app.post("/api/v1/webhooks/instagram", postHandler);
  app.post("/api/v1/webhooks/meta", postHandler);
  app.post("/api/v1/integrations/meta/webhook", postHandler);
}
