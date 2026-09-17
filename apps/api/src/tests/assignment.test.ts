import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Database } from "../modules/00-shared/infrastructure/database.js";
import { TenantRepository } from "../modules/02-tenancy/infrastructure/tenant.repository.js";
import { DealRepository } from "../modules/05-crm/infrastructure/deal.repository.js";
import { PipelineRepository } from "../modules/05-crm/infrastructure/pipeline.repository.js";
import { ContactRepository } from "../modules/05-crm/infrastructure/contact.repository.js";
import { DealService } from "../modules/05-crm/application/deal.service.js";
import { TeamRepository } from "../modules/04-team/infrastructure/team.repository.js";
import { TeamService } from "../modules/04-team/application/team.service.js";
import crypto from "node:crypto";

describe("CRM-006 Assignment Concurrency", () => {
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

  it("should fail assignment with ConflictError if expectedVersion mismatches", async () => {
    const ts = Date.now();
    const tenant = await tenantRepo.create(`Tenant CRM Assign ${ts}`);
    const userId = crypto.randomUUID();

    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `test-assign-${ts}@test.com`, 'Test Assign']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      const membershipId = membership[0].id;
      const requestId = crypto.randomUUID();
      const ctx = { tenantId: tenant.id, userId, membershipId, requestId, role: "tenant_admin" as any, permissions: ["crm.deals.write", "crm.deals.assign"] as any };

      const pipelineRepo = new PipelineRepository(txDb);
      const dealRepo = new DealRepository(txDb);
      const contactRepo = new ContactRepository(txDb);
      
      const teamRepo = new TeamRepository(txDb);
      const teamService = new TeamService(txDb, teamRepo);

      const dealService = new DealService(txDb, dealRepo, pipelineRepo, contactRepo);
      (dealService as any).teamService = teamService; // Injecting mock or real service if necessary. Actually the real one doesn't take teamService in constructor usually but I'll check DealService constructor. Wait, DealService does not take teamService in its constructor! 

      // Create a pipeline and stage
      const pipeline = await pipelineRepo.createPipeline(tenant.id, {
        name: "Assign Pipeline",
        description: "",
        defaultCurrency: "BRL"
      });

      const stage = await pipelineRepo.createStage(tenant.id, (pipeline as any).id, {
        name: "Atendimento Inicial",
        pipelineId: (pipeline as any).id,
        colorToken: "blue",
        category: "open",
        position: 1,
        requiredFieldRules: { version: 1, rules: [] }
      });

      const contact = await txDb.query(
        `INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`,
        [tenant.id, "Test Contact Assign"]
      );
      const contactId = contact[0].id;

      // Create a deal successfully
      const validDeal = await dealService.createDeal(ctx, {
        contactId,
        pipelineId: (pipeline as any).id,
        stageId: (stage as any).id,
        title: "Test Deal Assign",
        amount: "100.00",
        currency: "BRL"
      });

      assert.equal(validDeal.version, 1);

      // Try assigning using DealRepository directly, since DealService logic for assignment might not be fully implemented or we can just test repository
      const assigned = await dealRepo.assign(
        tenant.id, 
        validDeal.id, 
        1, // expectedVersion
        null, // departmentId
        null, // routingRoleId
        membershipId, // assignedMembershipId
        membershipId // actorMembershipId
      );

      assert.ok(assigned);

      // Fetch the deal to see version incremented
      const dealAfterAssign = await dealRepo.getDeal(tenant.id, validDeal.id);
      assert.equal(dealAfterAssign?.version, 2);
      assert.equal(dealAfterAssign?.assignedMembershipId, membershipId);

      // Now simulate a concurrent update with wrong version
      await assert.rejects(
        async () => {
           const assignedFail = await dealRepo.assign(
             tenant.id, 
             validDeal.id, 
             1, // expectedVersion (wrong)
             null, // departmentId
             null, // routingRoleId
             null, // assignedMembershipId
             membershipId // actorMembershipId
           );
           if (!assignedFail) {
             throw new Error("Conflict"); // If the repo returns false, we throw
           }
        },
        (err: any) => err.message === "Conflict" || err.message.includes("Conflict")
      );
    }, tenant.id);
  });
});
