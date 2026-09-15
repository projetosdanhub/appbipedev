import { Database } from "../../00-shared/infrastructure/database.js";
import { DealRepository } from "../infrastructure/deal.repository.js";
import { PipelineRepository } from "../infrastructure/pipeline.repository.js";
import { ContactRepository } from "../infrastructure/contact.repository.js";
import { type CreateCrmDeal, type UpdateCrmDeal, type MoveCrmDeal } from "@bipesend/contracts";
import { assertPermission } from "@bipesend/auth/policies";
import type { TenantContext } from "@bipesend/contracts";
import { DealEntity } from "../domain/deal.entity.js";

export class DealService {
  constructor(
    private readonly db: Database,
    private readonly dealRepository: DealRepository,
    private readonly pipelineRepository: PipelineRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async createDeal(context: TenantContext, input: CreateCrmDeal) {
    assertPermission(context, "crm.deals.write");
    const validated = DealEntity.validateCreate(input);

    await this.validateStageRules(context.tenantId, validated.stageId, validated.contactId, null, validated);

    return this.dealRepository.createDeal(context.tenantId, context.membershipId, validated);
  }

  async listDeals(context: TenantContext, pipelineId?: string) {
    assertPermission(context, "crm.deals.read");
    return this.dealRepository.listDeals(context.tenantId, pipelineId);
  }

  async getDeal(context: TenantContext, dealId: string) {
    assertPermission(context, "crm.deals.read");
    const deal = await this.dealRepository.getDeal(context.tenantId, dealId);
    if (!deal) {
      throw new Error("NOT_FOUND");
    }
    return deal;
  }

  async updateDeal(context: TenantContext, dealId: string, version: number, input: UpdateCrmDeal) {
    assertPermission(context, "crm.deals.write");
    const validated = DealEntity.validateUpdate(input);
    return this.dealRepository.updateDeal(context.tenantId, context.membershipId, dealId, version, validated);
  }

  async moveDeal(context: TenantContext, dealId: string, input: MoveCrmDeal) {
    assertPermission(context, "crm.deals.write");
    const validated = DealEntity.validateMove(input);

    const deal = await this.getDeal(context, dealId);

    await this.validateStageRules(context.tenantId, validated.toStageId, deal.contactId, dealId);

    return this.dealRepository.moveDeal(context.tenantId, context.membershipId, dealId, validated.expectedVersion, validated.toStageId, validated.lostReason ?? undefined);
  }

  private async validateStageRules(tenantId: string, stageId: string, contactId: string | null | undefined, dealId: string | null, dealPayload: any = {}) {
    // 1. Fetch Stage
    const stages = await this.db.query(
      `SELECT required_field_rules as "requiredFieldRules", name FROM pipeline_stages WHERE id = $1 AND tenant_id = $2`,
      [stageId, tenantId]
    );

    if (stages.length === 0) {
      throw new Error("STAGE_NOT_FOUND");
    }

    const stage = stages[0];
    const rulesData = stage.requiredFieldRules as any;
    if (!rulesData || !rulesData.rules || rulesData.rules.length === 0) {
      return; // No rules
    }

    // 2. Fetch Contact (and deal if updating)
    let contact = null;
    if (contactId) {
      const contacts = await this.db.query(
        `SELECT * FROM contacts WHERE id = $1 AND tenant_id = $2`,
        [contactId, tenantId]
      );
      contact = contacts[0] || null;
    }
    
    // In strict mode, if a deal requires contact fields but there's no contact, it fails.
    if (!contact && rulesData.rules.some((r: any) => r.entity === "contact")) {
      throw new Error(`Field contact is required for stage ${stage.name}`);
    }

    let deal = null;
    if (dealId) {
       const deals = await this.db.query(
         `SELECT * FROM deals WHERE id = $1 AND tenant_id = $2`,
         [dealId, tenantId]
       );
       deal = deals[0] || null;
    }
    
    const finalDeal = dealId ? { ...deal, ...dealPayload } : dealPayload;

    for (const rule of rulesData.rules) {
      // Very basic validation logic
      if (rule.entity === "contact") {
        if (rule.type === "native") {
          const value = (contact as any)[rule.field];
          if (value === null || value === undefined || value === "") {
            throw new Error(`Field ${rule.field} is required for stage ${stage.name}`);
          }
        }
      } else if (rule.entity === "deal") {
        if (rule.type === "native") {
          const value = (finalDeal as any)[rule.field];
          if (value === null || value === undefined || value === "") {
            throw new Error(`Field ${rule.field} is required for stage ${stage.name}`);
          }
        }
      }
    }
  }
}
