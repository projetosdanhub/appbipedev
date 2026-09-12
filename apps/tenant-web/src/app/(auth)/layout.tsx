import type { Metadata } from "next";
import { AuthLogo } from "./_components/auth-logo";

import { MessageCircle, ShieldCheck, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[100dvh] w-full flex bg-white lg:bg-transparent overflow-hidden">
      {/* 
        ════════════════════════════════════════
        PAINEL ESQUERDO — Imagem/Branding (Apenas Desktop)
        ════════════════════════════════════════ 
      */}
      <div className="hidden lg:flex lg:flex-1 relative flex-col justify-between p-12 h-full bg-[var(--color-surface-900)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: "url(/bg-login.png)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/25 via-black/40 to-[#6366F1]/25"
        />
        
        <div className="relative z-10 flex items-start">
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="space-y-2 max-w-[480px]">
            <h2 className="text-white text-[28px] font-bold leading-[1.15]">
              Tecnologia confiável para operações que não podem parar.
            </h2>
            <p className="text-white/80 text-[16px] leading-relaxed">
              Segurança, estabilidade e controle para suas conversas e sua operação comercial.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-white/90 text-[13px] font-medium">Conversas centralizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-white/90 text-[13px] font-medium">Operação confiável</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span className="text-white/90 text-[13px] font-medium">Acesso protegido</span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ════════════════════════════════════════
        PAINEL DIREITO — Autenticação (Mobile + Desktop)
        ════════════════════════════════════════ 
      */}
      <div className="
        flex w-full lg:w-[520px] flex-shrink-0
        flex-col items-center
        bg-white
        px-5 sm:px-8 lg:px-12
        h-[100dvh] overflow-y-auto
      ">
        <div className="w-full max-w-[420px] flex flex-col items-center my-auto py-12">
          <div className="mb-[28px] lg:mb-[32px] flex justify-center w-full">
            <AuthLogo />
          </div>

          <div className="w-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
