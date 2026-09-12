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
    <div className="flex min-h-screen bg-[var(--color-surface-50)] overflow-hidden">
      {/* Left Pane - Institutional Area */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 to-[var(--color-brand-600)] relative text-white">
        {/* Subtle abstract background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[var(--color-brand-700)] blur-[100px]" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-lg">
            <span className="text-[var(--color-brand-600)] font-bold text-2xl leading-none">B</span>
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">
            BipeSend
          </span>
        </div>

        <div className="relative z-10 max-w-md mt-16 mb-auto">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight animate-fade-in-up">
            Conecte. Automatize. Cresça.
          </h1>
          <p className="text-lg text-indigo-100/90 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            A plataforma que centraliza suas conversas, automatiza seus atendimentos e acompanha de perto todas as operações da sua empresa.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-indigo-200/60">
          &copy; {new Date().getFullYear()} BipeSend. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 bg-white dark:bg-[var(--color-surface-900)] relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8 animate-fade-in">
            <div className="w-10 h-10 rounded bg-[var(--color-brand-600)] flex items-center justify-center">
              <span className="text-white font-bold text-2xl leading-none">B</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              BipeSend
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

