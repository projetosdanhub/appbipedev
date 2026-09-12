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
      className="relative flex h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/bg-login.png)" }}
    >
      {/* Subtle dark overlay for card contrast */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Left side — Auth card */}
      <div className="relative z-10 flex w-full lg:w-auto items-center justify-center lg:justify-start px-4 sm:px-8 lg:pl-16 xl:pl-24">
        <div className="animate-auth-card-enter w-full max-w-[480px]">
          <div className="w-full bg-white/[0.97] backdrop-blur-[20px] rounded-[26px] shadow-2xl shadow-black/8 p-8 sm:p-10 border border-white/60 relative overflow-hidden">
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
