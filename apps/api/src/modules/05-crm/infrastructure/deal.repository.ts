import crypto from "node:crypto";
import { Database } from "../../00-shared/infrastructure/database.js";
import { type CreateCrmDeal, type UpdateCrmDeal } from "@bipesend/contracts";
import { DealEntity } from "../domain/deal.entity.js";

export class DealRepository {
  constructor(private readonly db: Database) {}

  async createDeal(tenantId: string, membershipId: string, input: CreateCrmDeal): Promise<DealEntity> {
    const rows = await this.db.query(
      `INSERT INTO deals (
        tenant_id, contact_id, pipeline_id, stage_id, title, amount, currency, 
        expected_close_date, department_id, routing_role_id, assigned_membership_id, 
        created_by_membership_id, updated_by_membership_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, tenant_id as "tenantId", contact_id as "contactId", pipeline_id as "pipelineId", 
        stage_id as "stageId", title, amount, currency, expected_close_date as "expectedCloseDate", 
        closed_at as "closedAt", lost_reason as "lostReason", department_id as "departmentId", 
        routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", 
        created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", 
        version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        tenantId, input.contactId || null, input.pipelineId, input.stageId, input.title, 
        input.amount || 0, input.currency || 'BRL', input.expectedCloseDate || null, 
        input.departmentId || null, input.routingRoleId || null, input.assignedMembershipId || null, 
        membershipId, membershipId
      ]
    );

    const deal = rows[0];

    await this.db.query(
      `INSERT INTO deal_stage_history (tenant_id, deal_id, to_stage_id, actor_membership_id, version, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, deal.id, input.stageId, membershipId, deal.version, "Deal created"]
    );

    return deal;
  }

  async listDeals(tenantId: string, pipelineId?: string, limit = 50, offset = 0): Promise<DealEntity[]> {
    let query = `SELECT 
        id, tenant_id as "tenantId", contact_id as "contactId", pipeline_id as "pipelineId", 
        stage_id as "stageId", title, amount, currency, expected_close_date as "expectedCloseDate", 
        closed_at as "closedAt", lost_reason as "lostReason", department_id as "departmentId", 
        routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", 
        created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", 
        version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"
       FROM deals
       WHERE tenant_id = $1`;
    const params: unknown[] = [tenantId];
    
    if (pipelineId) {
      params.push(pipelineId);
      query += ` AND pipeline_id = $2`;
    }
    
    const limitIdx = params.length + 1;
    params.push(limit, offset);
    
    query += ` ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`;
    
    return this.db.query(query, params);
  }

  async getDeal(tenantId: string, dealId: string): Promise<DealEntity | null> {
    const rows = await this.db.query(
      `SELECT 
        id, tenant_id as "tenantId", contact_id as "contactId", pipeline_id as "pipelineId", 
        stage_id as "stageId", title, amount, currency, expected_close_date as "expectedCloseDate", 
        closed_at as "closedAt", lost_reason as "lostReason", department_id as "departmentId", 
        routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", 
        created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", 
        version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"
       FROM deals
       WHERE id = $1 AND tenant_id = $2`,
      [dealId, tenantId]
    );
    return rows.length ? rows[0] : null;
  }

  async updateDeal(tenantId: string, membershipId: string, dealId: string, version: number, input: UpdateCrmDeal): Promise<DealEntity> {
    const currentRows = await this.db.query(
      `SELECT version FROM deals WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
      [dealId, tenantId]
    );

    if (currentRows.length === 0) throw new Error("NOT_FOUND");
    if (currentRows[0].version !== version) throw new Error("CONCURRENCY_CONFLICT");

    const sets = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) { sets.push(`title = $${idx++}`); values.push(input.title); }
    if (input.amount !== undefined) { sets.push(`amount = $${idx++}`); values.push(input.amount); }
    if (input.expectedCloseDate !== undefined) { sets.push(`expected_close_date = $${idx++}`); values.push(input.expectedCloseDate); }
    if (input.departmentId !== undefined) { sets.push(`department_id = $${idx++}`); values.push(input.departmentId); }
    if (input.routingRoleId !== undefined) { sets.push(`routing_role_id = $${idx++}`); values.push(input.routingRoleId); }
    if (input.assignedMembershipId !== undefined) { sets.push(`assigned_membership_id = $${idx++}`); values.push(input.assignedMembershipId); }

    if (sets.length === 0) {
      return (await this.getDeal(tenantId, dealId))!;
    }

    sets.push(`updated_by_membership_id = $${idx++}`); values.push(membershipId);
    sets.push(`version = version + 1`);
    sets.push(`updated_at = NOW()`);
    
    values.push(dealId, tenantId);

    const rows = await this.db.query(
      `UPDATE deals 
       SET ${sets.join(", ")} 
       WHERE id = $${idx} AND tenant_id = $${idx+1}
       RETURNING 
        id, tenant_id as "tenantId", contact_id as "contactId", pipeline_id as "pipelineId", 
        stage_id as "stageId", title, amount, currency, expected_close_date as "expectedCloseDate", 
        closed_at as "closedAt", lost_reason as "lostReason", department_id as "departmentId", 
        routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", 
        created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", 
        version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    return rows[0];
  }

  async moveDeal(tenantId: string, membershipId: string, dealId: string, version: number, toStageId: string, reason?: string): Promise<DealEntity> {
    const currentRows = await this.db.query(
      `SELECT version, stage_id as "stageId" FROM deals WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
      [dealId, tenantId]
    );

    if (currentRows.length === 0) throw new Error("NOT_FOUND");
    if (currentRows[0].version !== version) throw new Error("CONCURRENCY_CONFLICT");

    const fromStageId = currentRows[0].stageId;

    const rows = await this.db.query(
      `UPDATE deals 
       SET stage_id = $1, updated_by_membership_id = $2, version = version + 1, updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING 
        id, tenant_id as "tenantId", contact_id as "contactId", pipeline_id as "pipelineId", 
        stage_id as "stageId", title, amount, currency, expected_close_date as "expectedCloseDate", 
        closed_at as "closedAt", lost_reason as "lostReason", department_id as "departmentId", 
        routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", 
        created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", 
        version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
      [toStageId, membershipId, dealId, tenantId]
    );

    const deal = rows[0];

    await this.db.query(
      `INSERT INTO deal_stage_history (tenant_id, deal_id, from_stage_id, to_stage_id, actor_membership_id, version, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, deal.id, fromStageId, toStageId, membershipId, deal.version, reason || null]
    );

    return deal;
  }

  async assign(
    tenantId: string, 
    dealId: string, 
    expectedVersion: number, 
    departmentId: string | null, 
    routingRoleId: string | null, 
    assignedMembershipId: string | null,
    actorMembershipId: string
  ): Promise<DealEntity | null> {
    return this.db.withTransaction(async (txDb) => {
      // Fetch current state
      const currentRows = await txDb.query(
        `SELECT department_id as "departmentId", routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId" 
         FROM deals 
         WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [dealId, tenantId]
      );
      
      if (currentRows.length === 0) return null;
      const current = currentRows[0];

      const rows = await txDb.query(
        `UPDATE deals 
         SET department_id = $1, 
             routing_role_id = $2, 
             assigned_membership_id = $3, 
             updated_by_membership_id = $4,
             version = version + 1,
             updated_at = NOW()
         WHERE id = $5 AND tenant_id = $6 AND version = $7
         RETURNING 
          id, tenant_id as "tenantId", contact_id as "contactId", pipeline_id as "pipelineId", 
          stage_id as "stageId", title, amount, currency, expected_close_date as "expectedCloseDate", 
          closed_at as "closedAt", lost_reason as "lostReason", department_id as "departmentId", 
          routing_role_id as "routingRoleId", assigned_membership_id as "assignedMembershipId", 
          created_by_membership_id as "createdByMembershipId", updated_by_membership_id as "updatedByMembershipId", 
          version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [departmentId, routingRoleId, assignedMembershipId, actorMembershipId, dealId, tenantId, expectedVersion]
      );

      if (rows.length === 0) return null;
      const deal = rows[0];

      // Insert assignment history
      await txDb.query(
        `INSERT INTO assignment_histories (
          tenant_id, entity_type, entity_id, 
          from_department_id, from_routing_role_id, from_membership_id,
          to_department_id, to_routing_role_id, to_membership_id,
          actor_membership_id, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          tenantId, 'deal', dealId,
          current.departmentId, current.routingRoleId, current.assignedMembershipId,
          departmentId, routingRoleId, assignedMembershipId,
          actorMembershipId, deal.version
        ]
      );

      // Post outbox event
      await txDb.query(
        `INSERT INTO outbox_events (id, tenant_id, name, payload) VALUES ($1, $2, $3, $4)`,
        [
          crypto.randomUUID(),
          tenantId, 
          'crm.deal.assigned', 
          JSON.stringify({
            dealId,
            toDepartmentId: departmentId,
            toRoutingRoleId: routingRoleId,
            toMembershipId: assignedMembershipId,
            actorMembershipId,
            version: deal.version
          })
        ]
      );

      return deal;
    }, tenantId);
  }
}
