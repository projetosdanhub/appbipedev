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
        BACKGROUND GLOBAL (Ocupa a tela inteira)
        ════════════════════════════════════════ 
      */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat hidden lg:block"
        style={{ backgroundImage: "url(/bg-login.png)" }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-gradient-to-br from-[#007BFF]/25 via-black/60 to-[#6366F1]/25 hidden lg:block"
      />

      {/* 
        ════════════════════════════════════════
        PAINEL ESQUERDO — Autenticação (Mobile + Desktop)
        ════════════════════════════════════════ 
      */}
      <div className="
        flex w-full lg:w-[520px] flex-shrink-0
        flex-col items-center
        bg-white lg:rounded-r-[2.5rem] lg:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)]
        px-5 sm:px-8 lg:px-12
        h-[100dvh] overflow-y-auto relative z-20
      ">
        <div className="flex-1 min-h-[24px] lg:min-h-[48px]" aria-hidden="true" />
        <div className="w-full max-w-[420px] flex flex-col items-center py-8">
          <div className="mb-[28px] lg:mb-[32px] flex justify-center w-full">
            <AuthLogo />
          </div>

          <div className="w-full flex flex-col">
            {children}
          </div>
        </div>
        <div className="flex-1 min-h-[24px] lg:min-h-[48px]" aria-hidden="true" />
      </div>

      {/* 
        ════════════════════════════════════════
        PAINEL DIREITO — Branding (Apenas Desktop)
        ════════════════════════════════════════ 
      */}
      <div className="hidden lg:flex lg:flex-1 relative z-10 flex-col justify-between items-end text-right p-12 h-full">
        
        <div className="relative z-10 flex items-start">
        </div>

        <div className="relative z-10 flex flex-col gap-6 items-end">
          <div className="space-y-2 max-w-[480px]">
            <h2 className="text-white text-[28px] font-bold leading-[1.15]">
              Tecnologia confiável para operações que não podem parar.
            </h2>
            <p className="text-white/80 text-[16px] leading-relaxed">
              Segurança, estabilidade e controle para suas conversas e sua operação comercial.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-end gap-x-3 gap-y-3 mt-4">
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/5 transition-all hover:bg-white/20">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-white/95 text-[13px] font-medium tracking-wide">Conversas centralizadas</span>
            </div>
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/5 transition-all hover:bg-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-white/95 text-[13px] font-medium tracking-wide">Operação confiável</span>
            </div>
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/5 transition-all hover:bg-white/20">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span className="text-white/95 text-[13px] font-medium tracking-wide">Acesso protegido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
