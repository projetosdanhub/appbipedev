import { test } from "node:test";
import assert from "node:assert/strict";
import { webDocumentSchema, parseWebDocumentJson, publishingSpaceSchema, platformPagePublishedEventSchema, siteCreationIntentSchema, webLinkSchema, WEB_DOCUMENT_LIMITS } from "../src/web/index.js";
import { eventEnvelopeSchema } from "../src/index.js";
import { quotaLimitSchema, webEntitlementSnapshotSchema } from "../src/entitlements/index.js";
import { foodMoneySchema } from "../src/catalog/index.js";

const id = "00000000-0000-4000-8000-000000000001";
function node(name = "root"): any { return { id: name, version: 1, type: "container", props: { tag: "section", label: "Exemplo" }, styles: { base: {} }, children: [] }; }
function document(): any { return { schemaVersion: 1, title: "Exemplo", description: "", language: "pt-BR", root: node() }; }

test("roundtrip and versioned strict schema reject unsafe structure and props", () => {
  const valid = document();
  assert.deepEqual(parseWebDocumentJson(JSON.stringify(valid)), valid);
  for (const value of [
    { ...valid, schemaVersion: 2 }, { ...valid, tenantId: id },
    { ...valid, root: { ...node(), type: "php" } },
    { ...valid, root: { ...node(), props: { tag: "script", label: "Exemplo" } } },
    { ...valid, root: { ...node(), styles: { base: { background: "url(https://example.invalid)" } } } },
    { ...valid, root: { ...node(), children: [node("root")] } },
  ]) assert.equal(webDocumentSchema.safeParse(value).success, false);
  const polluted = JSON.parse(JSON.stringify(valid).replace('"base":{}', '"base":{"__proto__":{"polluted":true}}'));
  assert.equal(webDocumentSchema.safeParse(polluted).success, false);
  assert.equal(({} as any).polluted, undefined);
});

test("bounds run before recursion; cycles, excessive nodes/depth/UTF8 and getters fail closed", () => {
  const cyclic = document(); cyclic.root.children.push(cyclic.root);
  assert.equal(webDocumentSchema.safeParse(cyclic).success, false);
  const deep = document(); let current = deep.root;
  for (let i = 1; i < WEB_DOCUMENT_LIMITS.maxDepth; i++) { current.children.push(node(`n${i}`)); current = current.children[0]; }
  assert.equal(webDocumentSchema.safeParse(deep).success, true);
  current.children.push(node("too-deep"));
  assert.equal(webDocumentSchema.safeParse(deep).success, false);
  const wide = document(); wide.root.children = Array.from({ length: 499 }, (_, i) => node(`n${i}`));
  assert.equal(webDocumentSchema.safeParse(wide).success, true);
  wide.root.children.push(node("too-many"));
  assert.equal(webDocumentSchema.safeParse(wide).success, false);
  assert.throws(() => parseWebDocumentJson('"' + "😀".repeat(300000) + '"'), /WEB_DOCUMENT_TOO_LARGE/);
  const hostile = document(); Object.defineProperty(hostile.root, "payload", { enumerable: true, get() { throw Error("getter ran"); } });
  assert.equal(webDocumentSchema.safeParse(hostile).success, false);
});

test("URL policy blocks executable, protocol-relative, control and credential URLs", () => {
  for (const href of ["javascript:alert(1)", "data:text/html,test", "//example.invalid", "/\\example.invalid", "https://user:pass@example.invalid", " https://example.invalid", "https://example.invalid/\nscript"])
    assert.equal(webLinkSchema.safeParse(href).success, false, href);
  for (const href of ["/sobre", "#contato", "https://example.invalid/?x=%22&y=1"]) assert.equal(webLinkSchema.safeParse(href).success, true);
});

test("platform shape is separate from tenant events and client creation has no authority", () => {
  assert.equal(publishingSpaceSchema.safeParse({ scope: "platform", spaceId: id, tenantId: id }).success, false);
  assert.equal(publishingSpaceSchema.safeParse({ scope: "tenant", spaceId: id }).success, false);
  const event = { id, name: "web.page.published.v1", scope: "platform", spaceId: id, actorId: id, correlationId: "request-1", occurredAt: "2026-09-16T00:00:00Z", data: { siteId: id, pageId: id, releaseId: id, generation: 1 } };
  assert.equal(platformPagePublishedEventSchema.safeParse(event).success, true);
  assert.equal(eventEnvelopeSchema.safeParse(event).success, false);
  assert.equal(siteCreationIntentSchema.safeParse({ kind: "landing", title: "Site", slug: "site", scope: "platform" }).success, false);
});

test("quotas have explicit unlimited shape, valid vigency and no invented defaults", () => {
  for (const value of [-1, 999999, { kind: "limited", value: -1 }, { kind: "unlimited", value: 5 }]) assert.equal(quotaLimitSchema.safeParse(value).success, false);
  assert.deepEqual(quotaLimitSchema.parse({ kind: "unlimited" }), { kind: "unlimited" });
  const snapshot = { subject: { scope: "tenant", tenantId: id }, revision: 1, validFrom: "2026-09-16T00:00:00Z", validUntil: null, capabilities: {}, quotas: {} };
  assert.deepEqual(webEntitlementSnapshotSchema.parse(snapshot).capabilities, {});
  assert.equal(webEntitlementSnapshotSchema.safeParse({ ...snapshot, validUntil: "2026-09-15T00:00:00Z" }).success, false);
  assert.equal(webEntitlementSnapshotSchema.safeParse({ ...snapshot, capabilities: { "web.unknown": true } }).success, false);
  for (const money of ["0.00", "12.50"]) assert.equal(foodMoneySchema.safeParse(money).success, true);
  for (const money of [12.50, "01.00", "-1.00", "1.001"]) assert.equal(foodMoneySchema.safeParse(money).success, false);
});
