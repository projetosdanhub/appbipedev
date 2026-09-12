import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Database } from "../modules/00-shared/infrastructure/database.js";
import { TenantRepository } from "../modules/02-tenancy/infrastructure/tenant.repository.js";
import { UserRepository } from "../modules/01-identity/infrastructure/user.repository.js";
import { MembershipRepository } from "../modules/02-tenancy/infrastructure/membership.repository.js";

describe("RLS Tenancy and Identity", () => {
  let db: Database;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let membershipRepo: MembershipRepository;

  before(async () => {
    const databaseUrl = process.env["DATABASE_URL"] || "postgresql://api_user:api_pass@localhost:5432/bipesend";
    db = new Database(databaseUrl);
    tenantRepo = new TenantRepository(db);
    userRepo = new UserRepository(db);
    membershipRepo = new MembershipRepository(db);
  });

  after(async () => {
    await db.close();
  });

  it("should block reading or writing memberships outside a tenant context", async () => {
    const user = await userRepo.create("test1@example.com", "hash", "Test 1");
    const tenant = await tenantRepo.create("Tenant 1");
    
    await assert.rejects(
      async () => {
        // This should fail because we are NOT setting the RLS context using withTransaction.
        // It uses the raw db connection pool where `app.current_tenant_id` is not set.
        await db.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3)`, [tenant.id, user.id, 'member']);
      },
      (err: any) => {
        // The RLS policy explicitly requires tenant_id = current_tenant
        // Since current_tenant is null/undefined, this insert will violate the CHECK policy
        return err.message.includes("new row violates row-level security policy");
      }
    );
  });

  it("should allow writing memberships when inside correct tenant transaction", async () => {
    const user = await userRepo.create("test2@example.com", "hash", "Test 2");
    const tenant = await tenantRepo.create("Tenant 2");
    
    await db.withTransaction(async (client) => {
      const membership = await membershipRepo.createWithinContext(client, user.id, "owner");
      assert.equal(membership.tenantId, tenant.id);
      assert.equal(membership.userId, user.id);
      assert.equal(membership.role, "owner");

      const all = await membershipRepo.findAllWithinContext(client);
      assert.equal(all.length, 1);
    }, tenant.id);
  });

  it("should isolate reads between different tenants", async () => {
    const user3 = await userRepo.create("test3@example.com", "hash", "Test 3");
    const tenantA = await tenantRepo.create("Tenant A");
    const tenantB = await tenantRepo.create("Tenant B");

    // Add user3 to Tenant A
    await db.withTransaction(async (client) => {
      await membershipRepo.createWithinContext(client, user3.id, "owner");
    }, tenantA.id);

    // Read from Tenant A (Should see 1)
    await db.withTransaction(async (client) => {
      const all = await membershipRepo.findAllWithinContext(client);
      assert.equal(all.length, 1);
      assert.equal(all[0].tenantId, tenantA.id);
    }, tenantA.id);

    // Read from Tenant B (Should see 0)
    await db.withTransaction(async (client) => {
      const all = await membershipRepo.findAllWithinContext(client);
      assert.equal(all.length, 0); // Isolated
    }, tenantB.id);
  });
});
