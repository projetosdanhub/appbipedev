import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="relative flex h-screen items-center justify-center overflow-y-auto lg:overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/bg-login.png)' }}
    >
      {/* Darker overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Main content container */}
      <div className="relative z-10 flex w-full max-w-[1000px] mx-4 py-8 lg:my-0 flex-col-reverse lg:flex-row h-full lg:h-auto items-center">
        
        {/* Left side (Now Modal) — Floating card with form */}
        <div className="w-full lg:w-[55%] animate-card-enter flex justify-center lg:justify-start">
          <div className="w-full max-w-[460px] min-h-[660px] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-brand-900/10 p-8 sm:p-10 border border-white/50 flex flex-col relative overflow-hidden">
            {/* Soft gradient glass effect behind the form */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white/40 to-purple-50/40 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col flex-grow justify-center">
              {/* Mobile-only logo */}
              <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-600)] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl leading-none">B</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-[var(--color-ink-900)]">
                  BipeSend
                </span>
              </div>
              {children}
            </div>
          </div>
        </div>

        {/* Right side (Now Text) — Institutional text (desktop only) */}
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-center pl-8 xl:pl-16 h-[660px]">
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                <span className="text-white font-bold text-xl leading-none">B</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                BipeSend
              </span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-xs font-semibold text-white/70 tracking-widest uppercase leading-tight drop-shadow">
              Conversas<br/>Em Resultados
            </div>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-[1.15] text-white drop-shadow-md">
              Conecte.<br />
              Automatize.<br />
              <span className="text-[var(--color-brand-600)] drop-shadow-none">Cresça.</span>
            </h1>
            <p className="text-base text-white/90 leading-relaxed max-w-[400px] font-medium drop-shadow mb-8">
              Centralize suas conversas, automatize o atendimento e impulsione o crescimento do seu negócio com o BipeSend.
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-up delay-150">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white drop-shadow-sm">Atendimento inteligente</h3>
                <p className="text-sm text-white/70 mt-1 drop-shadow-sm max-w-[320px]">Responda mais rápido com automações e IA, sem perder o toque humano.</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white drop-shadow-sm">Prospecção organizada</h3>
                <p className="text-sm text-white/70 mt-1 drop-shadow-sm max-w-[320px]">Gerencie leads, conversas e oportunidades em um só lugar.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white drop-shadow-sm">Automação que escala</h3>
                <p className="text-sm text-white/70 mt-1 drop-shadow-sm max-w-[320px]">Crie fluxos, economize tempo e foque no que realmente importa: vender mais.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pb-2 pt-6 text-sm text-white/60 font-medium tracking-wide animate-fade-in drop-shadow" style={{ animationDelay: '300ms' }}>
            &quot;Mais produtividade. Mais clientes. Mais resultado.&quot;
          </div>
        </div>
      </div>
    </div>
  );
}

