import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const files = (await readdir(`${root}/rules`))
  .filter((file) => /^\d{2}_[A-Z_]+\.md$/.test(file))
  .sort();
const master = await readFile(`${root}/rules/00_MASTER.md`, "utf8");
const errors = [];
for (let index = 0; index < files.length; index++) {
  const file = files[index];
  if (Number(file.slice(0, 2)) !== index)
    errors.push(`Missing or duplicated rule number: ${index}`);
  if (index && !master.includes(file))
    errors.push(`Master does not reference ${file}`);
  if ((await readFile(`${root}/rules/${file}`, "utf8")).trim().length < 150)
    errors.push(`Empty rule: ${file}`);
}
if (files.length < 36) errors.push("Expected rules 00 through 35");
const packageNames = [
  "auth",
  "config",
  "contracts",
  "db",
  "events",
  "security",
  "ui",
  "logger",
];
for (const name of packageNames) {
  const pkg = JSON.parse(
    await readFile(`${root}/packages/${name}/package.json`, "utf8"),
  );
  if (pkg.name !== `@bipesend/${name}`)
    errors.push(`Invalid package name: ${name}`);
  if (
    !(await readFile(`${root}/packages/${name}/README.md`, "utf8")).includes(
      "##",
    )
  )
    errors.push(`Missing package guide: ${name}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Rules OK: ${files.length} active rules; ${packageNames.length} package guides. Content review: docs/audit/rules-review.md`,
);
