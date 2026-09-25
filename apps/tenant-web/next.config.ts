import type { NextConfig } from "next";
import { URL } from "url";
import * as fs from "fs";
import * as path from "path";

let ngrokHost = "";
try {
  let envStr = "";
  try {
    envStr = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
  } catch {}

  const match = envStr.match(/NGROK_PUBLIC_URL=(.+)/);
  if (match) {
    ngrokHost = new URL(match[1].trim()).hostname;
  } else if (process.env.NGROK_PUBLIC_URL) {
    ngrokHost = new URL(process.env.NGROK_PUBLIC_URL).hostname;
  }
} catch {}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async rewrites() {
    return [
      { source: "/politica-de-privacidade", destination: "/privacy" },
      { source: "/termos", destination: "/terms" },
      { source: "/exclusao-de-dados", destination: "/data-deletion" },
    ];
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://cloudflareinsights.com data:; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://cloudflareinsights.com data:; connect-src 'self' https://static.cloudflareinsights.com https://cloudflareinsights.com https://app.bipesend.com.br https://bipesend.com.br wss: ws: https:; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:;",
          },
        ],
      },
    ];
  },
  serverExternalPackages: [],
  experimental: {
    // next-intl usa isso
    serverActions: {
      allowedOrigins: [
        "app.bipesend.com.br",
        "bipesend.com.br",
        "www.bipesend.com.br",
        "admin.bipesend.com.br",
        "app.localhost",
        "app.localhost:3443",
        "app.localhost:3080",
        "localhost:3000",
        "127.0.0.1:3000",
        "localhost:3001",
        "127.0.0.1:3001",
        ngrokHost,
      ].filter(Boolean),
    },
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "::1",
    "app.bipesend.com.br",
    "bipesend.com.br",
    "www.bipesend.com.br",
    "admin.bipesend.com.br",
    "app.localhost",
    "admin.localhost",
    ngrokHost,
  ].filter(Boolean),
  transpilePackages: ["@bipesend/ui"],
};

export default nextConfig;
