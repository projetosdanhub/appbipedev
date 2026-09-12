import type { Metadata } from "next";
import Image from "next/image";

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
      {/* Left Pane - Form Area */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 relative z-10 bg-white dark:bg-[var(--color-surface-900)] shadow-2xl">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">B</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--color-content-base)]">
              BipeSend
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* Right Pane - Image Area */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply z-10" />
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/auth-bg.jpg"
          alt="BipeSend Background"
          fill
          priority
          sizes="(max-width: 1024px) 0vw, 50vw"
        />
      </div>
    </div>
  );
}
