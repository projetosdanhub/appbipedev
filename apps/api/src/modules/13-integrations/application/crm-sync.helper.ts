import crypto from "node:crypto";
import type { Database } from "../../00-shared/infrastructure/database.js";
import type { WebsocketGateway } from "../../15-events/infrastructure/websocket.gateway.js";

export interface SyncLeadToCrmParams {
  db: Database;
  gateway?: WebsocketGateway;
  tenantId: string;
  contactId: string;
  contactName: string;
  channel: "whatsapp" | "instagram" | "tiktok" | "telegram";
  previewText?: string;
}

/**
 * Garante que qualquer lead/contato que interaja pelo WhatsApp, Instagram, TikTok ou Telegram
 * possua um Deal ativo no CRM Kanban do BipeSend. Se não existir, cria automaticamente
 * no primeiro estágio do funil principal do workspace.
 */
export async function syncLeadToCrm({
  db,
  gateway,
  tenantId,
  contactId,
  contactName,
  channel,
  previewText,
}: SyncLeadToCrmParams) {
  try {
    // 1. Verifica se o contato já possui um Deal ativo
    const existingDeals = await db.query(
      "SELECT id, stage_id FROM deals WHERE tenant_id = $1 AND contact_id = $2 AND archived_at IS NULL LIMIT 1",
      [tenantId, contactId]
    );

    if (existingDeals.length > 0) {
      // Atualiza timestamp de última atividade do deal
      await db.query(
        "UPDATE deals SET updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
        [existingDeals[0].id, tenantId]
      );
      return existingDeals[0].id;
    }

    // 2. Busca pipeline ativa padrão do workspace (prioriza funil principal is_default = true)
    const pipelines = await db.query(
      "SELECT id FROM pipelines WHERE tenant_id = $1 AND status = 'active' ORDER BY is_default DESC, created_at ASC LIMIT 1",
      [tenantId]
    );

    if (pipelines.length === 0) {
      return null;
    }

    const pipelineId = pipelines[0].id;

    // 3. Busca o primeiro estágio do funil (coluna inicial)
    const stages = await db.query(
      "SELECT id, name FROM pipeline_stages WHERE tenant_id = $1 AND pipeline_id = $2 AND archived_at IS NULL ORDER BY position ASC LIMIT 1",
      [tenantId, pipelineId]
    );

    if (stages.length === 0) {
      return null;
    }

    const stageId = stages[0].id;

    // 4. Busca membership padrão do tenant para autoria
    const memberships = await db.query(
      "SELECT id FROM memberships WHERE tenant_id = $1 AND active = true ORDER BY created_at ASC LIMIT 1",
      [tenantId]
    );

    const membershipId = memberships.length > 0 ? memberships[0].id : null;
    if (!membershipId) {
      return null;
    }

    // 5. Criação atômica da oportunidade no CRM
    const dealId = crypto.randomUUID();
    const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "instagram" ? "Instagram" : channel === "tiktok" ? "TikTok" : "Telegram";
    const dealTitle = `${contactName || "Lead"} • ${channelLabel}`;

    await db.query(
      `INSERT INTO deals (
        id, tenant_id, contact_id, pipeline_id, stage_id, title,
        amount, currency, created_by_membership_id, updated_by_membership_id,
        created_at, updated_at, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'BRL', $8, $8, NOW(), NOW(), 1)`,
      [dealId, tenantId, contactId, pipelineId, stageId, dealTitle, 0, membershipId]
    );

    // 6. Registro de histórico de estágio
    const historyId = crypto.randomUUID();
    await db.query(
      `INSERT INTO deal_stage_histories (
        id, tenant_id, deal_id, from_stage_id, to_stage_id,
        changed_by_membership_id, reason, entered_at, version
      ) VALUES ($1, $2, $3, NULL, $4, $5, $6, NOW(), 1)`,
      [
        historyId,
        tenantId,
        dealId,
        stageId,
        membershipId,
        `Entrada automática via ${channelLabel}${previewText ? `: "${previewText.slice(0, 60)}"` : ""}`,
      ]
    );

    // 7. Notifica o CRM em tempo real via WebSocket
    gateway?.broadcastToTenant(tenantId, "crm.deal.created", {
      dealId,
      pipelineId,
      stageId,
      contactId,
      channel,
    });

    gateway?.broadcastToTenant(tenantId, "crm.changed", {
      pipelineId,
    });

    return dealId;
  } catch (error) {
    console.error("[syncLeadToCrm] Falha ao sincronizar lead com CRM:", error);
    return null;
  }
}
