import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Database } from "../modules/00-shared/infrastructure/database.js";
import { TenantRepository } from "../modules/02-tenancy/infrastructure/tenant.repository.js";
import { DealRepository } from "../modules/05-crm/infrastructure/deal.repository.js";
import { PipelineRepository } from "../modules/05-crm/infrastructure/pipeline.repository.js";
import { ContactRepository } from "../modules/05-crm/infrastructure/contact.repository.js";
import { DealService } from "../modules/05-crm/application/deal.service.js";
import crypto from "node:crypto";

describe("Deal Service and Pipeline Rules", () => {
  let db: Database;
  let tenantRepo: TenantRepository;

  before(async () => {
    const databaseUrl =
      process.env["DATABASE_URL"] ||
      "postgresql://api_user:api_pass@localhost:5432/bipesend";
    db = new Database(databaseUrl);
    tenantRepo = new TenantRepository(db);
  });

  after(async () => {
    await db.close();
  });

  it("should enforce requiredFieldRules when creating and moving deals", async () => {
    const ts = Date.now();
    const tenant = await tenantRepo.create(`Tenant CRM ${ts}`);
    const userId = crypto.randomUUID();

    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `test-${ts}@test.com`, 'Test']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      const membershipId = membership[0].id;
      const requestId = crypto.randomUUID();
      const ctx = { tenantId: tenant.id, userId, membershipId, requestId, role: "tenant_admin" as any, permissions: ["crm.pipelines.manage", "crm.deals.write"] as any };

      const pipelineRepo = new PipelineRepository(txDb);
      const dealRepo = new DealRepository(txDb);
      const contactRepo = new ContactRepository(txDb);
      const dealService = new DealService(txDb, dealRepo, pipelineRepo, contactRepo);

      // Create a pipeline
      const pipeline = await pipelineRepo.createPipeline(tenant.id, {
        name: "Sales Pipeline",
        description: "",
        defaultCurrency: "BRL"
      });

      // Create a stage with required rules
      const stage = await pipelineRepo.createStage(tenant.id, (pipeline as any).id, {
        name: "Qualified",
        pipelineId: (pipeline as any).id,
        colorToken: "blue-500",
        category: "open",
        position: 0,
        requiredFieldRules: {
          version: 1,
          rules: [
            {
              entity: "deal",
              field: "amount",
              type: "native"
            }
          ]
        }
      });

      const contact = await txDb.query(
        `INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`,
        [tenant.id, "Test Contact"]
      );
      const contactId = contact[0].id;

      // Attempt to create a deal in this stage without an amount
      await assert.rejects(
        async () => {
          await dealService.createDeal(ctx, {
            contactId,
            pipelineId: (pipeline as any).id,
            stageId: (stage as any).id,
            title: "Test Deal without Value",
            currency: "BRL"
          });
        },
        (err: any) => {
          return err.message.includes("Field amount is required for stage Qualified");
        }
      );

      // Create a deal successfully with the amount
      const validDeal = await dealService.createDeal(ctx, {
        contactId,
        pipelineId: (pipeline as any).id,
        stageId: (stage as any).id,
        title: "Test Deal with Value",
        amount: "100.00",
        currency: "BRL"
      });

      assert.equal(validDeal.amount, "100.00");
      assert.equal(validDeal.stageId, (stage as any).id);
    }, tenant.id);
  });

  it("should prevent concurrent updates on the same deal using version checking", async () => {
    const ts = Date.now();
    const tenant = await tenantRepo.create(`Tenant CRM Concurrency ${ts}`);
    const userId = crypto.randomUUID();

    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `test-${ts}@test.com`, 'Test']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      const membershipId = membership[0].id;
      const requestId = crypto.randomUUID();
      const ctx = { tenantId: tenant.id, userId, membershipId, requestId, role: "tenant_admin" as any, permissions: ["crm.pipelines.manage", "crm.deals.write"] as any };

      const pipelineRepo = new PipelineRepository(txDb);
      const dealRepo = new DealRepository(txDb);
      const contactRepo = new ContactRepository(txDb);
      const dealService = new DealService(txDb, dealRepo, pipelineRepo, contactRepo);

      const pipeline = await pipelineRepo.createPipeline(tenant.id, {
        name: "Sales",
        description: "",
        defaultCurrency: "BRL"
      });
      const stage = await pipelineRepo.createStage(tenant.id, (pipeline as any).id, {
        name: "Initial",
        pipelineId: (pipeline as any).id,
        colorToken: "gray-500",
        category: "open",
        position: 0,
        requiredFieldRules: { version: 1, rules: [] }
      });

      const contact = await txDb.query(
        `INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`,
        [tenant.id, "Test Contact 2"]
      );
      const contactId = contact[0].id;

      const deal = await dealService.createDeal(ctx, {
        contactId,
        pipelineId: (pipeline as any).id,
        stageId: (stage as any).id,
        title: "Concurrent Deal",
        currency: "BRL"
      });

      assert.equal(deal.version, 1);

      // First update (simulating user A)
      const updatedDealA = await dealService.updateDeal(ctx, deal.id, deal.version, {
        title: "Updated Title User A"
      });
      assert.equal(updatedDealA.version, 2);

      // Second update (simulating user B passing the old version 1)
      await assert.rejects(
        async () => {
          await dealService.updateDeal(ctx, deal.id, deal.version, {
            title: "Updated Title User B"
          });
        },
        (err: any) => err.message === "CONCURRENCY_CONFLICT"
      );
    }, tenant.id);
  });
});
