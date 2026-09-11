import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const textOf = async (relative) => readFile(new URL(relative, root), "utf8");
const failures = [];

const compose = await textOf("docker-compose.yml");
for (const port of [
  "127.0.0.1:5432:5432",
  "127.0.0.1:6379:6379",
  "127.0.0.1:1025:1025",
  "127.0.0.1:8025:8025",
  "127.0.0.1:9000:9000",
  "127.0.0.1:9001:9001"
]) {
  if (!compose.includes(port)) failures.push(`Compose port is not loopback-bound: ${port}`);
}

const gitignore = await textOf(".gitignore");
if (!gitignore.includes("infra/certs/*")) failures.push("Local certificates are not ignored");
if (!gitignore.includes("!infra/certs/.gitkeep")) failures.push("Certificate placeholder is not preserved");

const envExample = await textOf(".env.example");
if (/\b(sk-[A-Za-z0-9]|ghp_[A-Za-z0-9]|3J6WfYSfSx8YOb7)\b/.test(envExample)) {
  failures.push("A credential-like value exists in .env.example");
}

const localProxy = await textOf("infra/nginx/nginx.local.conf");
for (const marker of ["listen 443 ssl", "ssl_protocols TLSv1.2 TLSv1.3", "return 444", "deny-sensitive-files.conf"]) {
  if (!localProxy.includes(marker)) failures.push(`Local proxy is missing: ${marker}`);
}

const master = await textOf("rules/00_MASTER.md");
for (const rule of ["25_HTTPS_PROXY_FILE_SECURITY.md", "26_ERROR_CATALOG_AUDIT.md", "27_INTEGRATION_HEALTH.md"]) {
  if (!master.includes(rule)) failures.push(`Master rule does not reference ${rule}`);
}

try {
  await access(new URL("24_INTERACTIONS_MOTION_DATA_REFRESH.md", root));
  failures.push("Duplicated root interaction rule exists; canonical rules belong in rules/");
} catch {
  // Expected: the root duplicate must not exist.
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Security baseline OK");
