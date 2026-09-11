/**
 * INF-002 — Validação de configuração por schema no boot.
 *
 * Variáveis críticas ausentes ou inválidas impedem o boot.
 * Segredos nunca são expostos em logs ou respostas.
 */

import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carrega .env da raiz do monorepo
config({ path: resolve(__dirname, "../../../../.env") });

export interface EnvConfig {
  NODE_ENV: string;
  APP_NAME: string;
  API_HOST: string;
  API_PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  AUTH_SESSION_SECRET: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`[config] Missing required environment variable: ${key}`);
  }
  return value;
}

function requireEnvNotPlaceholder(key: string, placeholders: string[]): string {
  const value = requireEnv(key);
  if (placeholders.some((p) => value.includes(p))) {
    throw new Error(
      `[config] Environment variable ${key} still contains a placeholder value. Generate a real value.`
    );
  }
  return value;
}

export function loadEnv(): EnvConfig {
  const nodeEnv = process.env["NODE_ENV"] || "development";
  const appName = process.env["APP_NAME"] || "BipeSend";
  const apiHost = process.env["API_HOST"] || "127.0.0.1";
  const apiPort = parseInt(process.env["API_PORT"] || "4000", 10);

  if (!/^[a-zA-Z0-9_.: -]+$/.test(apiHost) || apiHost.includes(" ")) {
    throw new Error("[config] Invalid API_HOST");
  }

  if (isNaN(apiPort) || apiPort < 1 || apiPort > 65535) {
    throw new Error(`[config] Invalid API_PORT: ${process.env["API_PORT"]}`);
  }

  const databaseUrl = requireEnv("DATABASE_URL");
  const redisUrl = requireEnv("REDIS_URL");
  const authSecret = requireEnvNotPlaceholder("AUTH_SESSION_SECRET", [
    "replace_with",
  ]);

  return {
    NODE_ENV: nodeEnv,
    APP_NAME: appName,
    API_HOST: apiHost,
    API_PORT: apiPort,
    DATABASE_URL: databaseUrl,
    REDIS_URL: redisUrl,
    AUTH_SESSION_SECRET: authSecret,
  };
}
