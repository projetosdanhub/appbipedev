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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/bg-saas.jpg)' }}
    >
      {/* Light overlay for contrast */}
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />

      {/* Main content container */}
      <div className="relative z-10 flex w-full max-w-[1000px] mx-4 my-8 lg:my-12">
        
        {/* Left side — Institutional text (desktop only) */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-center pr-12">
          <div className="flex items-center gap-3 mb-10 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-white/70 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-sm">
              <span className="text-[var(--color-brand-700)] font-bold text-2xl leading-none">B</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              BipeSend
            </span>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-4xl lg:text-[2.75rem] font-bold mb-5 leading-[1.15] text-gray-900">
              Conecte.<br />
              Automatize.<br />
              Cresça.
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed max-w-[380px] font-medium">
              A plataforma que centraliza suas conversas, automatiza atendimentos e acompanha de perto as operações da sua empresa.
            </p>
          </div>

          <div className="mt-auto pt-16 text-sm text-gray-600 font-medium animate-fade-in" style={{ animationDelay: '300ms' }}>
            &copy; {new Date().getFullYear()} BipeSend. Todos os direitos reservados.
          </div>
        </div>

        {/* Right side — Floating card with form */}
        <div className="w-full lg:w-[55%] animate-card-enter flex justify-center lg:justify-end">
          <div className="w-full max-w-[460px] min-h-[660px] bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-brand-900/10 p-8 sm:p-10 border border-white/50 flex flex-col relative overflow-hidden">
            {/* Soft gradient glass effect behind the form */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white/40 to-purple-50/40 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col flex-grow">
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
      </div>
    </div>
  );
}

