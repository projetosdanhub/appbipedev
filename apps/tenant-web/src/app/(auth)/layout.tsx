import type { Metadata } from "next";
import { AuthLogo } from "./_components/auth-logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * background-attachment: fixed  →  imagem fica estática ao trocar de rota
     * min-h-[100dvh]                →  ocupa 100% da viewport sempre
     * overflow-y-auto               →  scroll na PAGE apenas se necessário (mobile pequeno)
     */
    <div className="relative min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex">
      {/* ── Background fixo ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg-login.png)" }}
      />
      {/* ── Overlay gradiente suave ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-br from-[#007BFF]/25 via-black/35 to-[#6366F1]/25"
      />

      {/* ── Orbs decorativos (apenas desktop) ── */}
      <div aria-hidden="true" className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-[#007BFF]/12 blur-[130px] pointer-events-none hidden lg:block -z-10" />
      <div aria-hidden="true" className="fixed bottom-[-150px] right-[-150px] w-[420px] h-[420px] rounded-full bg-[#6366F1]/12 blur-[110px] pointer-events-none hidden lg:block -z-10" />

      {/* ════════════════════════════════════════
          PAINEL ESQUERDO — Card de autenticação
      ════════════════════════════════════════ */}
      <div className="
        relative z-10
        flex w-full lg:w-[540px] xl:w-[580px] flex-shrink-0
        items-start justify-center
        px-4 sm:px-8
        pt-0 pb-4 lg:pb-8
        min-h-[100dvh]
      ">
        {/* Card glassmorphism */}
        <div className="auth-card-enter w-full">
          <div className="
            relative overflow-hidden
            rounded-b-[36px] rounded-t-none border-t-0
            bg-white/[0.82] backdrop-blur-[28px]
            border border-white/60
            shadow-[0_8px_32px_0_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.7)]
            p-5 sm:p-8 pt-4 sm:pt-6
            w-full
            transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]
            flex flex-col
          ">
            {/* Brilho interno (sheen) */}
            <div aria-hidden="true" className="absolute inset-0 rounded-b-[36px] bg-gradient-to-br from-white/55 via-transparent to-white/15 pointer-events-none" />
            {/* Barra de acento na base */}
            <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6366F1] via-[#007BFF] to-[#6366F1] bg-[length:200%_auto] animate-[gradient-x_3s_linear_infinite] z-20 pointer-events-none" />

            {/* Logo */}
            <div className="relative z-10 flex justify-center mb-3">
              <AuthLogo />
            </div>

            {/* Conteúdo da página (login / cadastro) */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          PAINEL DIREITO — Apenas background
      ════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 relative items-end justify-center pb-8">
        {/* Badge segurança */}
        <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse flex-shrink-0" />
          <span className="text-white/90 text-[13px] font-medium" style={{ fontFamily: "Poppins, sans-serif" }}>
            Plataforma 100% segura e criptografada
          </span>
        </div>
      </div>
    </div>
  );
}
