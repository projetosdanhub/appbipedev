import type { Metadata } from "next";
import Image from "next/image";
import { AuthLogo } from "./_components/auth-logo";
import { AuthLayout, GlassPill } from "@bipesend/ui";
import { MessageCircle, TrendingUp, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function TenantAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout
      logo={<AuthLogo />}
      backgroundNode={
        <Image
          src="/bg-login.png"
          alt="Plano de fundo"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      }
      brandingTitle="CRM confiável para operações que não podem parar."
      brandingDescription="Qualidade no atendimento, Portabilidade e Total Controle"
      brandingPills={
        <>
          <GlassPill icon={<MessageCircle />}>Conversas centralizadas</GlassPill>
          <GlassPill icon={<TrendingUp />}>Aumento em Vendas</GlassPill>
          <GlassPill icon={<KeyRound />}>Acesso protegido</GlassPill>
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}
