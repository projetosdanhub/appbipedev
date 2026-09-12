import type { NextConfig } from "next";
import { URL } from "url";
import * as fs from "fs";
import * as path from "path";

let ngrokHost = "";
try {
  let envStr = "";
  try {
    envStr = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
  } catch (e) {}

  const match = envStr.match(/NGROK_PUBLIC_URL=(.+)/);
  if (match) {
    ngrokHost = new URL(match[1].trim()).hostname;
  } else if (process.env.NGROK_PUBLIC_URL) {
    ngrokHost = new URL(process.env.NGROK_PUBLIC_URL).hostname;
  }
} catch (e) {}

const nextConfig: NextConfig = {
  // rewrites removed in favor of manual API proxy
  serverExternalPackages: [],
  experimental: {
    // next-intl usa isso
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '::1', ngrokHost].filter(Boolean),
};

export default nextConfig;
