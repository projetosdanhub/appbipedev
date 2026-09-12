import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painel do Tenant - BipeSend",
  description: "BipeSend Tenant Dashboard",
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </Providers>
      </body>
    </html>
  );
}
