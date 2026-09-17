import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inspectSource, dependencyCycles } from "./package-boundary-policy.mjs";
const root = resolve(import.meta.dirname, "..");
const errors = [], manifests = [];
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".next", "assets"].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(path));
    else if (/\.(tsx?|mjs)$/.test(path)) out.push(path);
  }
  return out;
}
for (const entry of await readdir(`${root}/packages`, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  manifests.push(JSON.parse(await readFile(`${root}/packages/${entry.name}/package.json`, "utf8")));
}
for (const path of await walk(`${root}/packages`)) {
  if (!path.includes("/src/") || /(?:\.test\.|\/__tests__\/)/.test(path)) continue;
  errors.push(...inspectSource(path, await readFile(path, "utf8"), root));
}
errors.push(...dependencyCycles(manifests));
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Package boundaries OK: ${manifests.length} packages, AST import checks and dependency graph. App builds remain a separate gate.`);
