import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectSource, dependencyCycles } from "../package-boundary-policy.mjs";
const root = "/workspace/project";
const path = `${root}/packages/web-builder/src/index.ts`;
test("guards side-effect/export/dynamic/relative imports and private environment access", () => {
  for (const source of ['import "@bipesend/db";', 'export * from "@bipesend/auth";', 'const x = import("node:fs");', 'const x = require("@bipesend/logger");', 'import "../../db/src/index";', 'import "../../../apps/api/src/main";', 'const x = process["env"].DATABASE_URL;', 'const x = import(target);']) assert.ok(inspectSource(path, source, root).length, source);
  assert.deepEqual(inspectSource(path, 'import { createNode } from "@bipesend/web-builder-core";', root), []);
  assert.ok(inspectSource(`${root}/packages/web-renderer/src/index.ts`, 'import "@bipesend/web-builder";', root).length);
  assert.ok(inspectSource(`${root}/packages/web-builder-core/src/index.ts`, 'import "react";', root).length);
});
test("detects a transitive cycle without treating diamond sharing as a cycle", () => {
  assert.equal(dependencyCycles([{ name: "a", dependencies: { b: "*", c: "*" } }, { name: "b", dependencies: { c: "*" } }, { name: "c" }]).length, 0);
  assert.ok(dependencyCycles([{ name: "a", dependencies: { b: "*" } }, { name: "b", dependencies: { c: "*" } }, { name: "c", dependencies: { a: "*" } }]).length);
});
