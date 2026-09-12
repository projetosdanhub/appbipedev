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
              Painel<br/>Superadmin
            </div>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-[1.15] text-white drop-shadow-md">
              Controle.<br />
              Gerencie.<br />
              <span className="text-[var(--color-brand-600)] drop-shadow-none">Escale.</span>
            </h1>
            <p className="text-base text-white/90 leading-relaxed max-w-[400px] font-medium drop-shadow mb-8">
              Tenha controle total sobre a operação SaaS, gerencie inquilinos e acompanhe métricas em tempo real.
            </p>
          </div>

          <div className="space-y-6 animate-fade-in-up delay-150">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white drop-shadow-sm">Gestão centralizada</h3>
                <p className="text-sm text-white/70 mt-1 drop-shadow-sm max-w-[320px]">Administre todos os workspaces e configurações do sistema em um só lugar.</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white drop-shadow-sm">Métricas de performance</h3>
                <p className="text-sm text-white/70 mt-1 drop-shadow-sm max-w-[320px]">Acompanhe o faturamento, crescimento de clientes e uso de recursos.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white drop-shadow-sm">Segurança avançada</h3>
                <p className="text-sm text-white/70 mt-1 drop-shadow-sm max-w-[320px]">Controle acessos, audite logs e mantenha a infraestrutura segura.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pb-2 pt-6 text-sm text-white/60 font-medium tracking-wide animate-fade-in drop-shadow" style={{ animationDelay: '300ms' }}>
            &quot;Estabilidade. Segurança. Escalabilidade.&quot;
          </div>
        </div>
      </div>
    </div>
  );
}
