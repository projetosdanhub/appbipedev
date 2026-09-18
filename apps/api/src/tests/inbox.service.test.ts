import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Database } from "../modules/00-shared/infrastructure/database.js";
import { TenantRepository } from "../modules/02-tenancy/infrastructure/tenant.repository.js";
import { InboxService } from "../modules/06-inbox/application/inbox.service.js";
import crypto from "node:crypto";

describe("InboxService", () => {
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

  it("should create a conversation and add an internal note", async () => {
    const ts = Date.now();
    const tenant = await tenantRepo.create(`Tenant Inbox ${ts}`);
    const userId = crypto.randomUUID();

    await db.withTransaction(async (txDb) => {
      await txDb.query(
        `INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`,
        [userId, `inbox-${ts}@test.com`, "Test User"]
      );
      const membership = await txDb.query(
        `INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`,
        [tenant.id, userId, "tenant_admin"]
      );
      const membershipId = membership[0].id;

      // Create a contact for the conversation
      const contactRows = await txDb.query(
        `INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`,
        [tenant.id, "Contact Inbox Test"]
      );
      const contactId = contactRows[0].id;

      const inboxService = new InboxService(txDb);

      // 1. Create conversation
      const conv = await inboxService.createConversation(tenant.id, membershipId, {
        contactId,
        subject: "Test Conversation",
        source: "internal_crm",
      });

      assert.ok(conv.id, "Should have a conversation ID");
      assert.equal(conv.contactId, contactId);
      assert.equal(conv.status, "open");
      assert.equal(conv.source, "internal_crm");
      assert.equal(conv.createdByMembershipId, membershipId);

      // 2. Add internal note (should NOT trigger external providers)
      const note = await inboxService.addInternalNote(tenant.id, conv.id, membershipId, {
        text: "This is an internal note for the team.",
      });

      assert.ok(note.id, "Note should have an ID");
      assert.equal(note.conversationId, conv.id);
      assert.equal(note.kind, "internal_note");
      assert.equal(note.direction, "internal");
      assert.equal(note.text, "This is an internal note for the team.");

      // 3. List messages for conversation
      const messages = await inboxService.getMessages(tenant.id, conv.id);
      assert.equal(messages.length, 1, "Should have exactly 1 message");
      assert.equal(messages[0].kind, "internal_note");

      // 4. Get conversations by contact
      const contactConvs = await inboxService.getConversationsByContact(tenant.id, contactId);
      assert.equal(contactConvs.length, 1, "Should find 1 conversation for the contact");
      assert.equal(contactConvs[0].id, conv.id);
    }, tenant.id);
  });

  it("should update conversation status with history", async () => {
    const ts = Date.now();
    const tenant = await tenantRepo.create(`Tenant Status ${ts}`);
    const userId = crypto.randomUUID();

    await db.withTransaction(async (txDb) => {
      await txDb.query(
        `INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`,
        [userId, `status-${ts}@test.com`, "Test"]
      );
      const membership = await txDb.query(
        `INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`,
        [tenant.id, userId, "tenant_admin"]
      );
      const membershipId = membership[0].id;

      const contactRows = await txDb.query(
        `INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`,
        [tenant.id, "Contact Status Test"]
      );
      const contactId = contactRows[0].id;

      const inboxService = new InboxService(txDb);

      const conv = await inboxService.createConversation(tenant.id, membershipId, {
        contactId,
        source: "internal_crm",
      });

      assert.equal(conv.status, "open");

      // Close the conversation
      const closed = await inboxService.updateConversationStatus(
        tenant.id,
        conv.id,
        "closed",
        membershipId,
        "Resolved",
        conv.version
      );

      assert.equal(closed.status, "closed");
      assert.ok(closed.closedAt, "Should have closedAt timestamp");

      // Verify version was bumped
      assert.equal(closed.version, conv.version + 1);
    }, tenant.id);
  });

  it("should isolate conversations between tenants", async () => {
    const ts = Date.now();
    const tenantA = await tenantRepo.create(`Tenant Iso A ${ts}`);
    const tenantB = await tenantRepo.create(`Tenant Iso B ${ts}`);
    const userIdA = crypto.randomUUID();
    const userIdB = crypto.randomUUID();

    // Create conversation in tenant A
    let convIdA: string;
    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userIdA, `iso-a-${ts}@test.com`, "User A"]);
      const membershipA = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenantA.id, userIdA, "tenant_admin"]);
      const contactA = await txDb.query(`INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`, [tenantA.id, "Contact A"]);

      const inboxService = new InboxService(txDb);
      const conv = await inboxService.createConversation(tenantA.id, membershipA[0].id, {
        contactId: contactA[0].id,
        source: "internal_crm",
      });
      convIdA = conv.id;
    }, tenantA.id);

    // Try to read tenant A's conversation from tenant B
    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (id) DO NOTHING`, [userIdB, `iso-b-${ts}@test.com`, "User B"]);
      await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenantB.id, userIdB, "tenant_admin"]);

      const inboxService = new InboxService(txDb);

      // Tenant B should not find tenant A's conversations
      const result = await inboxService.getConversation(tenantB.id, convIdA!);
      assert.equal(result, null, "Tenant B should NOT be able to read Tenant A's conversation");

      const allB = await inboxService.getAllConversations(tenantB.id);
      assert.equal(allB.length, 0, "Tenant B should have 0 conversations");
    }, tenantB.id);
  });
});
