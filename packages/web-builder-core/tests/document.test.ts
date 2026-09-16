import { test } from "node:test";
import assert from "node:assert/strict";
import { webDocumentSchema } from "@bipesend/contracts/web";
import { applyCommand, createHistory, createNode, executeCommand, undo, redo, resolveStyles, describeSiteCreation, MAX_HISTORY_ENTRIES } from "../src/index.js";

function fixture() {
  const root = createNode("container", "root");
  root.children.push(createNode("heading", "title"), createNode("text", "body"));
  return webDocumentSchema.parse({ schemaVersion: 1, title: "Exemplo", description: "", language: "pt-BR", root });
}
test("commands are atomic/immutable and reject missing, cyclic, duplicate or protected targets", () => {
  const initial = fixture(); const before = JSON.stringify(initial);
  const changed = applyCommand(initial, { type: "props", nodeId: "title", props: { text: "Novo título" } });
  assert.equal((changed.root.children[0]!.props as any).text, "Novo título");
  const section = createNode("container", "section"); section.children.push(createNode("container", "child"));
  const nested = applyCommand(initial, { type: "insert", parentId: "root", index: 1, node: section });
  assert.throws(() => applyCommand(nested, { type: "move", nodeId: "section", parentId: "child", index: 0 }), /INVALID_MOVE/);
  assert.throws(() => applyCommand(initial, { type: "remove", nodeId: "root" }), /ROOT_PROTECTED/);
  assert.throws(() => applyCommand(initial, { type: "props", nodeId: "missing", props: {} }), /NODE_NOT_FOUND/);
  assert.throws(() => applyCommand(initial, { type: "insert", parentId: "title", index: 0, node: section }), /INVALID_PARENT/);
  assert.throws(() => applyCommand(initial, { type: "insert", parentId: "root", index: 0, node: createNode("text", "title") }));
  assert.throws(() => applyCommand(initial, { type: "props", nodeId: "title", props: { onClick: "alert(1)" } }));
  assert.equal(JSON.stringify(initial), before);
});
test("move uses final index, history restores content and branching discards redo", () => {
  let history = createHistory(fixture());
  history = executeCommand(history, { type: "move", nodeId: "title", parentId: "root", index: 1 });
  assert.deepEqual(history.present.root.children.map((node) => node.id), ["body", "title"]);
  assert.deepEqual(redo(undo(history)).present, history.present);
  history = executeCommand(undo(history), { type: "remove", nodeId: "body" });
  assert.equal(history.future.length, 0);
  assert.equal(undo(history).present.root.children.length, 2);
  for (let i = 0; i < 55; i++) history = executeCommand(history, { type: "props", nodeId: "title", props: { text: `Título ${i}` } });
  assert.equal(history.past.length, MAX_HISTORY_ENTRIES);
});
test("mobile-first inheritance preserves zero and restores only the override", () => {
  const styles = { base: { padding: 24, gap: 16 }, tablet: { padding: 0 }, desktop: { gap: 32 } };
  assert.deepEqual(resolveStyles(styles, "desktop"), { padding: 0, gap: 32 });
  assert.deepEqual(resolveStyles({ base: styles.base, tablet: styles.tablet }, "desktop"), { padding: 0, gap: 16 });
  assert.deepEqual(resolveStyles(styles, "base"), { padding: 24, gap: 16 });
});
test("food creation describes one site + home + catalog, with no implicit grant", () => {
  assert.deepEqual(describeSiteCreation({ kind: "food", title: "Comida", slug: "comida", catalog: { kind: "food", currency: "BRL", fulfillment: ["pickup", "delivery"] } }), {
    capabilities: ["web.enabled", "food.delivery"], quotaChanges: { "web.sites.max": 1, "web.pages.max": 1, "web.catalogs.max": 1 },
  });
  assert.deepEqual(describeSiteCreation({ kind: "landing", title: "Site", slug: "site" }).quotaChanges, { "web.sites.max": 1, "web.pages.max": 1 });
});
