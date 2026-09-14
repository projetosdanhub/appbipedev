import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  errors = [];
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".next", "assets"].includes(entry.name))
      continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (/\.(tsx?|mjs)$/.test(path)) out.push(path);
  }
  return out;
}
for (const path of await walk(`${root}/packages`)) {
  const source = await readFile(path, "utf8"),
    imports = [
      ...source.matchAll(/(?:from\s+|import\s*\()['"]([^'"]+)['"]/g),
    ].map((m) => m[1]);
  if (imports.some((i) => i.includes("/apps/")))
    errors.push(`Package imports app: ${path.slice(root.length + 1)}`);
  if (
    path.includes("/packages/ui/") &&
    imports.some((i) =>
      /^@bipesend\/(auth|db|security|config|events)(\/|$)/.test(i),
    )
  )
    errors.push(`UI imports server package: ${path.slice(root.length + 1)}`);
  if (
    path.includes("/packages/ui/src/") &&
    /process\.env\.(?:AUTH|DATABASE|REDIS|.*SECRET|.*KEY)/.test(source)
  )
    errors.push(`UI reads server environment: ${path.slice(root.length + 1)}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "Package import boundaries OK (static scan; runtime bundling checked by app builds)",
);
