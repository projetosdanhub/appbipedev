import type { Metadata } from "next";

import { AuthLogo } from "./_components/auth-logo";

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
      className="relative flex min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-white lg:bg-transparent"
    >
      {/* ── Background fixo (Apenas Desktop) ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 hidden lg:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg-login.png)" }}
      />
      
      {/* Overlay escuro para destaque no desktop */}
      <div className="fixed inset-0 -z-10 hidden lg:block bg-black/20 pointer-events-none" />

      {/* Center — Auth panel */}
      <div className="relative z-10 flex w-full min-h-[100dvh] lg:min-h-screen items-center justify-center lg:p-4">
        <div className="w-full lg:max-w-[480px]">
          <div className="w-full flex flex-col justify-center bg-white lg:rounded-2xl lg:shadow-2xl lg:shadow-black/10 px-5 py-8 sm:px-8 lg:p-12 relative overflow-hidden min-h-[100dvh] lg:min-h-0">
            <div className="relative z-10 w-full max-w-[400px] mx-auto flex flex-col items-center flex-1 lg:flex-none justify-center">
              {/* Logo */}
              <div className="flex items-center justify-center mb-8 w-full">
                <AuthLogo />
              </div>

              <div className="w-full">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
