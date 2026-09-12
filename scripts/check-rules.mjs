import { readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../rules/", import.meta.url);
const expected = [
  "00_MASTER.md", "01_PRODUCT_SCOPE.md", "02_ARCHITECTURE.md", "03_TENANCY.md",
  "04_SECURITY.md", "05_AUTH_RBAC.md", "06_DATABASE.md", "07_API_EVENTS.md",
  "08_QUEUES.md", "09_AI_RAG_MCP.md", "10_WHATSAPP.md", "11_BILLING_PLANS.md",
  "12_UX_UI.md", "13_ACCESSIBILITY_SEO.md", "14_DESIGN_TOKENS.md",
  "15_INTEGRATIONS.md", "16_TESTING.md", "17_DEVOPS_DOCKER.md",
  "18_NAMING_CONVENTIONS.md", "19_DATA_GOVERNANCE.md", "20_AI_AGENT_COMMANDS.md",
  "21_CONFIGURATION.md", "22_LAYOUT_COMPONENTS.md", "23_MODULAR_ARCHITECTURE.md",
  "24_INTERACTIONS_MOTION_DATA_REFRESH.md",
  "25_HTTPS_PROXY_FILE_SECURITY.md",
  "26_ERROR_CATALOG_AUDIT.md",
  "27_INTEGRATION_HEALTH.md",
  "28_AUTH_SURFACES_BOOTSTRAP.md"
];

const files = new Set(await readdir(root));
const missing = expected.filter((name) => !files.has(name));
if (missing.length) {
  console.error(`Missing rules: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`Rules OK: ${expected.length} files`);
