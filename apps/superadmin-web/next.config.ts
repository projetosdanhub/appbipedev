import type { NextConfig } from "next";
import { URL } from "url";
import * as fs from "fs";
import * as path from "path";

let ngrokHost = "";
try {
  const envPath = path.resolve(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const envStr = fs.readFileSync(envPath, "utf8");
    for (const line of envStr.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }

    const match = envStr.match(/NGROK_PUBLIC_URL=(.+)/);
    if (match) {
      ngrokHost = new URL(match[1].trim()).hostname;
    }
  }
  if (!ngrokHost && process.env.NGROK_PUBLIC_URL) {
    ngrokHost = new URL(process.env.NGROK_PUBLIC_URL).hostname;
  }
} catch {}

const nextConfig: NextConfig = {
  transpilePackages: ["@bipesend/ui"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "admin.bipesend.com.br",
        "bipesend.com.br",
        "app.bipesend.com.br",
        "admin.localhost",
        "admin.localhost:3443",
        "admin.localhost:3080",
        "localhost:3000",
        "127.0.0.1:3000",
        "localhost:3002",
        "127.0.0.1:3002",
        ngrokHost,
      ].filter(Boolean),
    },
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "::1",
    "admin.bipesend.com.br",
    "bipesend.com.br",
    "app.bipesend.com.br",
    "app.localhost",
    "admin.localhost",
    ngrokHost,
  ].filter(Boolean),
};

export default nextConfig;
