import { Database } from "../../00-shared/infrastructure/database.js";
import { type CreateCrmPipeline, type UpdateCrmPipeline, type CreateCrmPipelineStage, type UpdateCrmPipelineStage } from "@bipesend/contracts";
import { PipelineEntity, PipelineStageEntity } from "../domain/pipeline.entity.js";

export class PipelineRepository {
  constructor(private readonly db: Database) {}

  async createPipeline(tenantId: string, input: CreateCrmPipeline): Promise<PipelineEntity> {
    return this.db.withTransaction(async (txDb) => {
      const nameNormalized = input.name.toLowerCase().trim();
      const rows = await txDb.query(
        `INSERT INTO pipelines (tenant_id, name, name_normalized, description, default_currency) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, tenant_id as "tenantId", name, name_normalized as "nameNormalized", description, status, default_currency as "defaultCurrency", version, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.name, nameNormalized, input.description || null, input.defaultCurrency || 'BRL']
      );
      return { ...rows[0], stages: [] };
    }, tenantId);
  }

  async listPipelines(tenantId: string): Promise<PipelineEntity[]> {
    return this.db.withTransaction(async (txDb) => {
      const pipelines = await txDb.query(
        `SELECT id, tenant_id as "tenantId", name, name_normalized as "nameNormalized", description, status, default_currency as "defaultCurrency", version, created_at as "createdAt", updated_at as "updatedAt"
         FROM pipelines 
         WHERE tenant_id = $1 
         ORDER BY created_at ASC`,
        [tenantId]
      );

      if (pipelines.length === 0) return [];

      const pipelineIds = pipelines.map(p => p.id);
      const stages = await txDb.query(
        `SELECT id, tenant_id as "tenantId", pipeline_id as "pipelineId", name, position, color_token as "colorToken", category, required_field_rules as "requiredFieldRules", version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM pipeline_stages
         WHERE pipeline_id = ANY($1) AND tenant_id = $2 AND archived_at IS NULL
         ORDER BY position ASC, created_at ASC`,
        [pipelineIds, tenantId]
      );

      const stagesByPipelineId = stages.reduce((acc, stage) => {
        acc[stage.pipelineId] = acc[stage.pipelineId] || [];
        acc[stage.pipelineId].push(stage);
        return acc;
      }, {} as Record<string, PipelineStageEntity[]>);

      return pipelines.map(p => ({
        ...p,
        stages: stagesByPipelineId[p.id] || []
      }));
    }, tenantId);
  }

  async getPipeline(tenantId: string, pipelineId: string): Promise<PipelineEntity | null> {
    return this.db.withTransaction(async (txDb) => {
      const rows = await txDb.query(
        `SELECT id, tenant_id as "tenantId", name, name_normalized as "nameNormalized", description, status, default_currency as "defaultCurrency", version, created_at as "createdAt", updated_at as "updatedAt"
         FROM pipelines 
         WHERE id = $1 AND tenant_id = $2`,
        [pipelineId, tenantId]
      );
      if (!rows.length) return null;

      const stages = await txDb.query(
        `SELECT id, tenant_id as "tenantId", pipeline_id as "pipelineId", name, position, color_token as "colorToken", category, required_field_rules as "requiredFieldRules", version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM pipeline_stages
         WHERE pipeline_id = $1 AND tenant_id = $2 AND archived_at IS NULL
         ORDER BY position ASC, created_at ASC`,
        [pipelineId, tenantId]
      );

      return { ...rows[0], stages };
    }, tenantId);
  }

  async updatePipeline(tenantId: string, pipelineId: string, input: UpdateCrmPipeline): Promise<PipelineEntity> {
    return this.db.withTransaction(async (txDb) => {
      const sets = [];
      const values: any[] = [];
      let idx = 1;

      if (input.name !== undefined) {
        sets.push(`name = $${idx++}`);
        values.push(input.name);
        sets.push(`name_normalized = $${idx++}`);
        values.push(input.name.toLowerCase().trim());
      }
      if (input.description !== undefined) {
        sets.push(`description = $${idx++}`);
        values.push(input.description);
      }
      if (input.defaultCurrency !== undefined) {
        sets.push(`default_currency = $${idx++}`);
        values.push(input.defaultCurrency);
      }

      if (sets.length === 0) {
        const p = await this.getPipeline(tenantId, pipelineId);
        if (!p) throw new Error("NOT_FOUND");
        return p;
      }

      sets.push(`version = version + 1`);
      sets.push(`updated_at = NOW()`);
      values.push(pipelineId, tenantId);

      const rows = await txDb.query(
        `UPDATE pipelines 
         SET ${sets.join(", ")} 
         WHERE id = $${idx} AND tenant_id = $${idx+1}
         RETURNING id, tenant_id as "tenantId", name, name_normalized as "nameNormalized", description, status, default_currency as "defaultCurrency", version, created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      if (!rows.length) throw new Error("NOT_FOUND");
      return { ...rows[0], stages: [] };
    }, tenantId);
  }

  async listStages(tenantId: string, pipelineId: string): Promise<PipelineStageEntity[]> {
    return this.db.withTransaction(async (txDb) => {
      const rows = await txDb.query(
        `SELECT id, tenant_id as "tenantId", pipeline_id as "pipelineId", name, position, color_token as "colorToken", category, required_field_rules as "requiredFieldRules", version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM pipeline_stages
         WHERE pipeline_id = $1 AND tenant_id = $2 AND archived_at IS NULL
         ORDER BY position ASC, created_at ASC`,
        [pipelineId, tenantId]
      );
      return rows;
    }, tenantId);
  }

  async createStage(tenantId: string, pipelineId: string, input: CreateCrmPipelineStage): Promise<PipelineStageEntity> {
    return this.db.withTransaction(async (txDb) => {
      const rulesJson = JSON.stringify(input.requiredFieldRules || { version: 1, rules: [] });
      const rows = await txDb.query(
        `INSERT INTO pipeline_stages (tenant_id, pipeline_id, name, category, color_token, position, required_field_rules)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, tenant_id as "tenantId", pipeline_id as "pipelineId", name, position, color_token as "colorToken", category, required_field_rules as "requiredFieldRules", version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, pipelineId, input.name, input.category || 'open', input.colorToken || null, input.position ?? 0, rulesJson]
      );
      return rows[0];
    }, tenantId);
  }

  async updateStage(tenantId: string, stageId: string, input: UpdateCrmPipelineStage): Promise<PipelineStageEntity> {
    return this.db.withTransaction(async (txDb) => {
      const sets = [];
      const values: any[] = [];
      let idx = 1;

      if (input.name !== undefined) {
        sets.push(`name = $${idx++}`);
        values.push(input.name);
      }
      if (input.category !== undefined) {
        sets.push(`category = $${idx++}`);
        values.push(input.category);
      }
      if (input.colorToken !== undefined) {
        sets.push(`color_token = $${idx++}`);
        values.push(input.colorToken);
      }
      if (input.position !== undefined) {
        sets.push(`position = $${idx++}`);
        values.push(input.position);
      }
      if (input.requiredFieldRules !== undefined) {
        sets.push(`required_field_rules = $${idx++}`);
        values.push(JSON.stringify(input.requiredFieldRules));
      }

      if (sets.length === 0) throw new Error("No fields to update");

      sets.push(`version = version + 1`);
      sets.push(`updated_at = NOW()`);
      values.push(stageId, tenantId);

      const rows = await txDb.query(
        `UPDATE pipeline_stages 
         SET ${sets.join(", ")} 
         WHERE id = $${idx} AND tenant_id = $${idx+1}
         RETURNING id, tenant_id as "tenantId", pipeline_id as "pipelineId", name, position, color_token as "colorToken", category, required_field_rules as "requiredFieldRules", version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      if (!rows.length) throw new Error("NOT_FOUND");
      return rows[0];
    }, tenantId);
  }

  async getStage(tenantId: string, stageId: string): Promise<PipelineStageEntity | null> {
    return this.db.withTransaction(async (txDb) => {
      const rows = await txDb.query(
        `SELECT id, tenant_id as "tenantId", pipeline_id as "pipelineId", name, position, color_token as "colorToken", category, required_field_rules as "requiredFieldRules", version, archived_at as "archivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM pipeline_stages
         WHERE id = $1 AND tenant_id = $2`,
        [stageId, tenantId]
      );
      return rows.length ? rows[0] : null;
    }, tenantId);
  }

  async deletePipeline(tenantId: string, pipelineId: string): Promise<void> {
    return this.db.withTransaction(async (txDb) => {
      const deals = await txDb.query(
        `SELECT id FROM deals WHERE pipeline_id = $1 AND tenant_id = $2 LIMIT 1`,
        [pipelineId, tenantId]
      );
      if (deals.length > 0) {
        throw new Error("CANNOT_DELETE_PIPELINE_WITH_DEALS");
      }

      const rows = await txDb.query(
        `DELETE FROM pipelines WHERE id = $1 AND tenant_id = $2 RETURNING id`,
        [pipelineId, tenantId]
      );
      if (!rows.length) {
        throw new Error("NOT_FOUND");
      }
    }, tenantId);
  }

  async deleteStage(tenantId: string, stageId: string): Promise<void> {
    return this.db.withTransaction(async (txDb) => {
      const deals = await txDb.query(
        `SELECT id FROM deals WHERE stage_id = $1 AND tenant_id = $2 LIMIT 1`,
        [stageId, tenantId]
      );
      if (deals.length > 0) {
        throw new Error("CANNOT_DELETE_STAGE_WITH_DEALS");
      }

      const rows = await txDb.query(
        `DELETE FROM pipeline_stages WHERE id = $1 AND tenant_id = $2 RETURNING id`,
        [stageId, tenantId]
      );
      if (!rows.length) {
        throw new Error("NOT_FOUND");
      }
    }, tenantId);
  }
}
