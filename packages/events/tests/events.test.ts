import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createEvent,
  appendOutbox,
  tenantEventKey,
  retryDelay,
} from "../src/index.ts";
const ctx = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  userId: "22222222-2222-4222-8222-222222222222",
  membershipId: "33333333-3333-4333-8333-333333333333",
  role: "agent" as const,
  permissions: [],
  requestId: "req1",
};
test("events carry validated tenant scope; rollback failure never becomes success", async () => {
  const event = createEvent(ctx, "crm.contact.created.v1", {
    contactId: ctx.userId,
  });
  assert.ok(tenantEventKey(event, "indexer").includes(ctx.tenantId));
  await assert.rejects(
    appendOutbox(
      {
        insertOutbox: async () => {
          throw new Error("rollback");
        },
      },
      event,
    ),
  );
  assert.throws(() => createEvent(ctx, "arbitrary", {}));
  assert.throws(() => tenantEventKey(event, "../escape"));
});
test("backoff remains capped", () => {
  assert.equal(
    retryDelay(20, () => 0.5),
    45000,
  );
  assert.throws(() => retryDelay(-1));
});
