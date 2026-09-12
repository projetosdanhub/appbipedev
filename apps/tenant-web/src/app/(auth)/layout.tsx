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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-[#1e2a5a] to-[var(--color-brand-700)]">
      {/* Abstract background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute top-[55%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--color-brand-600)]/20 blur-[100px]" />
        <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[80px]" />
      </div>

      {/* Grid pattern overlay for texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex w-full max-w-[1100px] mx-4 my-8 lg:my-12">
        
        {/* Left side — Institutional text (desktop only) */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-center pr-16">
          <div className="flex items-center gap-3 mb-12 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
              <span className="text-white font-bold text-2xl leading-none">B</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              BipeSend
            </span>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-4xl lg:text-[2.75rem] font-bold mb-6 leading-[1.15] text-white">
              Conecte.<br />
              Automatize.<br />
              Cresça.
            </h1>
            <p className="text-lg text-indigo-200/80 leading-relaxed max-w-[380px]">
              A plataforma que centraliza suas conversas, automatiza atendimentos e acompanha de perto as operações da sua empresa.
            </p>
          </div>

          <div className="mt-auto pt-20 text-sm text-indigo-300/40 animate-fade-in" style={{ animationDelay: '300ms' }}>
            &copy; {new Date().getFullYear()} BipeSend. Todos os direitos reservados.
          </div>
        </div>

        {/* Right side — Floating card with form */}
        <div className="w-full lg:w-[55%] animate-card-enter">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/20 p-8 sm:p-10 lg:p-12 border border-white/10 dark:border-gray-800">
            {/* Mobile-only logo */}
            <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-600)] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl leading-none">B</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[var(--color-ink-900)] dark:text-white">
                BipeSend
              </span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
