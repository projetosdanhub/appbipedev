import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url);

const apiModules = [
  "00-shared", "01-identity", "02-tenancy", "03-authorization", "04-team",
  "05-crm", "06-inbox", "07-messaging", "08-automation", "09-knowledge",
  "10-catalog", "11-pages", "12-billing", "13-integrations", "14-platform",
  "99-test-support"
];
const layers = ["domain", "application", "infrastructure", "presentation", "tests"];
const frontendApps = ["tenant-web", "superadmin-web", "marketing-web"];
const frontendDirs = ["app", "features", "components", "lib", "styles", "tests"];
const aiDirs = ["00_shared", "01_ingestion", "02_retrieval", "03_generation", "04_tools", "05_evaluation", "99_test_support"];
const packageDirs = ["ui", "db", "auth", "contracts", "events", "security", "config"];

const dirs = [];
for (const moduleName of apiModules) {
  for (const layer of layers) dirs.push(`apps/api/src/modules/${moduleName}/${layer}`);
}
for (const app of frontendApps) {
  for (const dir of frontendDirs) dirs.push(`apps/${app}/src/${dir}`);
}
dirs.push(
  "apps/tenant-web/src/app/(auth)/login",
  "apps/tenant-web/src/app/(auth)/forgot-password",
  "apps/tenant-web/src/app/(workspace)/dashboard",
  "apps/tenant-web/src/app/(workspace)/inbox",
  "apps/tenant-web/src/app/(workspace)/crm",
  "apps/tenant-web/src/features/identity",
  "apps/tenant-web/src/features/team",
  "apps/tenant-web/src/features/crm",
  "apps/tenant-web/src/features/inbox",
  "apps/tenant-web/src/features/billing",
  "apps/superadmin-web/src/features/platform",
  "apps/superadmin-web/src/features/tenants",
  "apps/superadmin-web/src/features/plans",
  "apps/superadmin-web/src/features/rules",
  "apps/marketing-web/src/features/landing",
  "apps/marketing-web/src/features/seo",
  "services/ai-service/app",
  ...aiDirs.map((dir) => `services/ai-service/app/${dir}`),
  "services/ai-service/tests",
  ...packageDirs.flatMap((pkg) => [
    `packages/${pkg}/src`,
    `packages/${pkg}/tests`
  ]),
  "infra/docker",
  "infra/nginx"
);

for (const relative of dirs) {
  await mkdir(new URL(relative + "/", root), { recursive: true });
  const keep = new URL(join(relative, ".gitkeep"), root);
  try {
    await access(keep);
  } catch {
    await writeFile(keep, "", { flag: "wx" });
  }
}

console.log(`Modular skeleton ready: ${dirs.length} directories checked/created.`);
