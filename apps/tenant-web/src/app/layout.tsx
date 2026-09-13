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
  metadataBase: new URL("https://bipesend.com.br"),
  title: "BipeSend | Plataforma Completa de CRM e Automações",
  description: "Centralize seu atendimento, gerencie clientes e crie campanhas eficientes com a BipeSend. A plataforma SaaS líder em CRM e automações.",
  keywords: ["CRM", "Automação", "Atendimento", "SaaS", "BipeSend", "Campanhas", "Gestão de Clientes"],
  authors: [{ name: "BipeSend Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://bipesend.com.br",
    title: "BipeSend | Plataforma Completa de CRM e Automações",
    description: "Centralize seu atendimento, gerencie clientes e crie campanhas eficientes com a BipeSend. A plataforma SaaS líder em CRM e automações.",
    siteName: "BipeSend",
    images: [
      {
        url: "https://bipesend.com.br/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BipeSend - Plataforma SaaS",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BipeSend | CRM e Automações",
    description: "Plataforma de gestão de clientes e atendimento centralizado.",
  }
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </Providers>
      </body>
    </html>
  );
}
