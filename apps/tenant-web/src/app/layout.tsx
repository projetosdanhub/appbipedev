import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: { default: "BipeSend | Painel do Cliente • Agentes de IA, CRM Plus & WhatsApp", template: "%s | BipeSend" },
  description: "Acesse seu workspace BipeSend — Plataforma Oficial de Agentes de IA, CRM Plus, WhatsApp Multicanal e Disparos Inteligentes.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/brand/icon-logomarca-degradê-webp.webp", type: "image/webp" },
    ],
    shortcut: "/favicon.svg",
    apple: "/assets/brand/icon-logomarca-degradê-webp.webp",
  },
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} antialiased h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
