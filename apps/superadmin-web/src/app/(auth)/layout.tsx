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
      className="relative flex min-h-[100dvh] lg:h-[100dvh] w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/bg-login.png)" }}
    >
      {/* Subtle dark overlay for card contrast */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Center — Auth card */}
      <div className="relative z-10 flex w-full min-h-screen items-center justify-center p-4">
        <div className="animate-auth-card-enter w-full max-w-[420px]">
          <div className="w-full flex flex-col justify-center bg-white/[0.85] lg:bg-white/[0.96] backdrop-blur-[20px] rounded-[26px] shadow-2xl shadow-black/10 p-8 sm:p-10 border border-white/60 relative overflow-hidden">
            {/* Inner glass sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/30 pointer-events-none" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center justify-center mb-8">
                <AuthLogo />
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right side — Only the background image, no UI elements */}
    </div>
  );
}
