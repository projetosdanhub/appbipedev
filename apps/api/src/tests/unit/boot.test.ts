import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mainPath = resolve(__dirname, "../../../src/main.ts");

test("API boot fails fast when critical config is missing", () => {
  assert.throws(
    () => {
      // Executa o script sem as variáveis de ambiente necessárias
      execSync(`npx tsx ${mainPath}`, {
        env: {
          ...process.env,
          DATABASE_URL: "", // Faltando a DB url
        },
        stdio: "pipe",
      });
    },
    (err: any) => {
      // Verifica se o erro gerado contém os detalhes de validação (Zod)
      return err.message.includes("DATABASE_URL");
    },
    "Expected API boot to fail due to missing DATABASE_URL",
  );
});
