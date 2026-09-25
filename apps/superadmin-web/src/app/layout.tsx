import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "BipeSend SuperAdmin | Painel Master & Gestão da Plataforma",
  robots: { index: false, follow: false },
  description: "Painel de controle master da plataforma BipeSend — Gestão global de tenants, planos, infraestrutura e métricas.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/brand/icon-logomarca-degradê-webp.webp", type: "image/webp" },
    ],
    shortcut: "/favicon.svg",
    apple: "/assets/brand/icon-logomarca-degradê-webp.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} antialiased h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
