import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const files = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { cwd: root, encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /AKIA[0-9A-Z]{16}/,
  /sk-(?:live-|proj-)[A-Za-z0-9_-]{24,}/,
];
const failures = [];
for (const file of new Set(files)) {
  if (
    !/\.(?:[cm]?[jt]sx?|json|ya?ml|md|sql|conf|env|txt|pem|key)$/.test(file) &&
    !file.endsWith(".env.example")
  )
    continue;
  let body;
  try {
    body = await readFile(resolve(root, file), "utf8");
  } catch {
    continue;
  }
  if (patterns.some((pattern) => pattern.test(body))) failures.push(file);
}
if (failures.length) {
  console.error(
    "Credential pattern detected in files (values hidden):\n" +
      failures.join("\n"),
  );
  process.exit(1);
}
console.log(
  "Secret pattern scan OK; operational secret scanning/history review remains required",
);
