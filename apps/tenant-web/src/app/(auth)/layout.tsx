import type { Metadata } from "next";
import { AuthLogo } from "./_components/auth-logo";
import { AuthLayout, GlassPill } from "@bipesend/ui";
import { MessageCircle, TrendingUp, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TenantAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout
      logo={<AuthLogo />}
      backgroundImage="/bg-login.png"
      brandingTitle="CRM confiável para operações que não podem parar."
      brandingDescription="Rapidez no atendimento, portabilidade e total controle"
      brandingPills={
        <>
          <GlassPill icon={<MessageCircle />}>Conversas centralizadas</GlassPill>
          <GlassPill icon={<TrendingUp />}>Aumento de vendas</GlassPill>
          <GlassPill icon={<KeyRound />}>Acesso protegido</GlassPill>
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}
