import type { Metadata } from "next";
import { AuthLogo } from "./_components/auth-logo";

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

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 shadow-xl w-fit">
            <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse flex-shrink-0" />
            <span className="text-white/90 text-[13px] font-medium" style={{ fontFamily: "Poppins, sans-serif" }}>
              Plataforma 100% segura e criptografada
            </span>
          </div>
        </div>
      </div>

      {/* 
        ════════════════════════════════════════
        PAINEL DIREITO — Autenticação (Mobile + Desktop)
        ════════════════════════════════════════ 
      */}
      <div className="
        flex w-full lg:w-[480px] xl:w-[560px] flex-shrink-0
        flex-col items-center
        bg-white
        px-5 sm:px-8 lg:px-12 xl:px-16
        h-[100dvh] overflow-y-auto
      ">
        <div className="w-full max-w-[420px] flex flex-col items-center py-12 lg:py-16 my-auto">
          <div className="mb-10 lg:mb-12 flex justify-center w-full mt-4 lg:mt-0">
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
