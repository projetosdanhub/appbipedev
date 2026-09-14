import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canGrantRole,
  hasPermission,
  resolveTenantContext,
  normalizeTenantRole,
} from "../src/policies.ts";
const userId = "11111111-1111-4111-8111-111111111111",
  tenantId = "22222222-2222-4222-8222-222222222222",
  membershipId = "33333333-3333-4333-8333-333333333333";
test("tenant header is only a selector; suspended and unrelated membership are rejected", async () => {
  for (const member of [
    null,
    { id: membershipId, userId, tenantId, role: "admin", active: false },
    {
      id: membershipId,
      userId: membershipId,
      tenantId,
      role: "admin",
      active: true,
    },
  ]) {
    await assert.rejects(
      resolveTenantContext(
        { findMembership: async () => member },
        { userId, tenantId, requestId: "req1" },
      ),
    );
  }
});
test("RBAC rejects another tenant and prevents creating an admin", async () => {
  const ctx = await resolveTenantContext(
    {
      findMembership: async () => ({
        id: membershipId,
        userId,
        tenantId,
        role: "manager",
        active: true,
      }),
    },
    { userId, tenantId, requestId: "req1" },
  );
  assert.equal(hasPermission(ctx, "crm.contacts.read", tenantId), true);
  assert.equal(hasPermission(ctx, "crm.contacts.read", membershipId), false);
  assert.equal(
    hasPermission(ctx, "billing.subscription.manage", tenantId),
    false,
  );
  assert.equal(canGrantRole(ctx, "tenant_admin"), false);
  assert.equal(canGrantRole(ctx, "agent"), true);
  assert.throws(() => normalizeTenantRole("platform_owner"));
});
