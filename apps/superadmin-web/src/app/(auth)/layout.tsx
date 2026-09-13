import type { Metadata } from "next";
import { AuthLogo } from "./_components/auth-logo";
import { AuthLayout, GlassPill } from "@bipesend/ui";
import { ShieldCheck, Activity, Settings } from "lucide-react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuperadminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout
      logo={<AuthLogo />}
      backgroundImage="/bg-login.png"
      brandingTitle="Painel Superadmin"
      brandingDescription="Controle, segurança e gestão centralizada para toda a operação."
      brandingPills={
        <>
          <GlassPill icon={<ShieldCheck />}>Segurança avançada</GlassPill>
          <GlassPill icon={<Activity />}>Monitoramento</GlassPill>
          <GlassPill icon={<Settings />}>Gestão global</GlassPill>
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}
