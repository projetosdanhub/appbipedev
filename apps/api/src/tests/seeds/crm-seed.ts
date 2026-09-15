import { Database } from "../../modules/00-shared/infrastructure/database.js";
import { loadEnv } from "../../config/env.js";

async function run() {
  const env = loadEnv();
  const db = new Database(env.DATABASE_URL);
  console.log("Starting synthetic data seeder for CRM...");

  try {
    // Check if we already have a tenant
    const tenants = await db.query("SELECT id FROM tenant LIMIT 2");
    
    if (tenants.length === 0) {
      console.log("No tenants found. Creating synthetic tenants...");
      // For a complete synthetic generation, we would use OnboardingService,
      // but since we just need data for testing the UI, let's insert minimally.
      const t1 = await db.query(`INSERT INTO tenant (name, current_status) VALUES ('Tenant A', 'active') RETURNING id`);
      const t2 = await db.query(`INSERT INTO tenant (name, current_status) VALUES ('Tenant B', 'active') RETURNING id`);
      tenants.push({ id: t1[0].id }, { id: t2[0].id });
    }

    const tenantId1 = tenants[0].id;

    // Create a dummy user/membership if not exists
    const users = await db.query("SELECT id FROM \"user\" LIMIT 1");
    let userId;
    if (users.length === 0) {
      const u = await db.query(`
        INSERT INTO "user" (email, email_normalized, name, password_hash) 
        VALUES ('admin@synthetic.local', 'admin@synthetic.local', 'Admin', 'hash') RETURNING id
      `);
      userId = u[0].id;
    } else {
      userId = users[0].id;
    }

    const memberships = await db.query("SELECT id FROM membership WHERE tenant_id = $1 LIMIT 1", [tenantId1]);
    let membershipId;
    if (memberships.length === 0) {
      const m = await db.query(`
        INSERT INTO membership (tenant_id, user_id, role, current_status) 
        VALUES ($1, $2, 'tenant_admin', 'active') RETURNING id
      `, [tenantId1, userId]);
      membershipId = m[0].id;
    } else {
      membershipId = memberships[0].id;
    }

    // Insert synthetic contacts
    console.log(`Inserting synthetic contacts for Tenant ${tenantId1}...`);
    
    await db.query(`
      INSERT INTO crm_contact (tenant_id, name, email, email_normalized, phone, created_by_membership_id, source)
      VALUES 
        ($1, 'Alice Smith', 'alice@example.com', 'alice@example.com', '+1234567890', $2, 'manual'),
        ($1, 'Bob Jones', 'bob@example.com', 'bob@example.com', '+0987654321', $2, 'manual')
      ON CONFLICT DO NOTHING
    `, [tenantId1, membershipId]);

    console.log("Seeding complete!");

  } catch (err) {
    console.error("Failed to seed CRM data:", err);
  } finally {
    await db.close();
  }
}

run();
