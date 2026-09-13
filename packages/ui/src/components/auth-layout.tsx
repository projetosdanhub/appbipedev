import * as React from "react";
import { cn } from "../lib/utils";

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  backgroundImage?: string;
  brandingTitle?: string;
  brandingDescription?: string;
  brandingPills?: React.ReactNode;
}

export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  (
    {
      className,
      children,
      logo,
      backgroundImage,
      brandingTitle,
      brandingDescription,
      brandingPills,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-[100dvh] w-full flex bg-white lg:bg-transparent lg:overflow-hidden",
          className
        )}
        {...props}
      >
        {/* BACKGROUND GLOBAL */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat hidden lg:block"
          style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
        />
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-gradient-to-br from-[#007BFF]/25 via-black/60 to-[#6366F1]/25 hidden lg:block"
        />
        
        {/* PAINEL ESQUERDO — Autenticação */}
        <div className="w-full lg:w-[520px] flex-shrink-0 bg-white lg:rounded-r-[2.5rem] lg:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)] min-h-[100dvh] lg:h-[100dvh] lg:overflow-y-auto custom-scrollbar relative z-20 flex flex-col">
          
          {/* Ondas Decorativas Abstratas */}
          <div className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden h-[300px] z-0">
            <svg className="absolute top-[-50px] left-[-50px] w-[350px] md:w-[450px] h-auto opacity-[0.35] mix-blend-multiply" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H400C400 0 350 250 150 280C-50 310 0 0 0 0Z" fill="url(#wave-top)" />
              <defs>
                <linearGradient id="wave-top" x1="0" y1="0" x2="350" y2="300" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#079CF5" />
                  <stop offset="1" stopColor="#A827F5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="absolute bottom-0 right-0 w-full pointer-events-none overflow-hidden h-[300px] z-0">
            <svg className="absolute bottom-[-50px] right-[-50px] w-[350px] md:w-[450px] h-auto opacity-[0.35] mix-blend-multiply rotate-180" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H400C400 0 350 250 150 280C-50 310 0 0 0 0Z" fill="url(#wave-bottom)" />
              <defs>
                <linearGradient id="wave-bottom" x1="0" y1="0" x2="350" y2="300" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5759F5" />
                  <stop offset="1" stopColor="#079CF5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex-1 min-h-[24px] lg:min-h-[48px]" aria-hidden="true" />
          <div className="w-full max-w-[420px] mx-auto flex flex-col items-center py-8 px-5 sm:px-8 lg:px-12 relative z-10">
            {logo && <div className="mb-[32px] flex justify-center w-full">{logo}</div>}
            <div className="w-full flex flex-col">
              {children}
            </div>
          </div>
          <div className="flex-1 min-h-[24px] lg:min-h-[48px]" aria-hidden="true" />
        </div>

        {/* PAINEL DIREITO — Branding */}
        <div className="hidden lg:flex lg:flex-1 relative z-10 flex-col justify-between items-end text-right p-12 h-full">
          <div className="relative z-10 flex items-start"></div>
          
          <div className="relative z-10 flex flex-col gap-6 items-end justify-end h-full">
             {/* Text and pills aligned to bottom right */}
            <div className="space-y-2 max-w-[480px]">
              {brandingTitle && (
                <h2 className="text-white text-[28px] font-bold leading-[1.15]">
                  {brandingTitle}
                </h2>
              )}
              {brandingDescription && (
                <p className="text-white/80 text-[16px] leading-relaxed">
                  {brandingDescription}
                </p>
              )}
            </div>
            
            {brandingPills && (
              <div className="flex flex-wrap justify-end gap-x-3 gap-y-3 mt-4">
                {brandingPills}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
AuthLayout.displayName = "AuthLayout";
