import * as React from "react";
import { cn } from "../lib/utils";

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  backgroundImage?: string;
  backgroundNode?: React.ReactNode;
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
      backgroundNode,
      brandingTitle,
      brandingDescription,
      brandingPills,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        data-theme="light"
        ref={ref}
        className={cn(
          "relative h-[100dvh] w-full flex bg-[#FFFFFF] lg:bg-transparent overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* BACKGROUND GLOBAL (Apenas Desktop) */}
        {backgroundNode ? (
          <div aria-hidden="true" className="fixed inset-0 z-0 hidden lg:block">
            {backgroundNode}
          </div>
        ) : backgroundImage ? (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat hidden lg:block"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : null}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-gradient-to-br from-[#007BFF]/25 via-black/60 to-[#6366F1]/25 hidden lg:block"
        />

        {/* PAINEL ESQUERDO — Autenticação */}
        <div className="w-full lg:w-[520px] flex-shrink-0 bg-white lg:rounded-r-[2.5rem] lg:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)] h-[100dvh] overflow-hidden relative z-20">
          {/* Curva Top-Left (Mobile & Desktop Left Panel) */}
          <div
            className="absolute z-0 pointer-events-none"
            style={{
              top: "-145px",
              left: "-165px",
              width: "clamp(340px, 50vw, 460px)",
              height: "clamp(270px, 40vh, 340px)",
              transform: "rotate(-8deg)",
            }}
          >
            <div
              className="w-full h-full"
              style={{
                borderRadius: "100%",
                background:
                  "linear-gradient(135deg, rgba(150,201,255,0.34) 0%, rgba(189,210,255,0.20) 58%, rgba(215,207,255,0.12) 100%)",
              }}
            />
          </div>

          {/* Curva Bottom-Right (Mobile & Desktop Left Panel) */}
          <div
            className="absolute z-0 pointer-events-none"
            style={{
              bottom: "-165px",
              right: "-185px",
              width: "clamp(360px, 50vw, 480px)",
              height: "clamp(280px, 40vh, 360px)",
              transform: "rotate(-12deg)",
            }}
          >
            <div
              className="w-full h-full"
              style={{
                borderRadius: "100%",
                background:
                  "linear-gradient(135deg, rgba(196,218,255,0.16) 0%, rgba(209,198,255,0.24) 62%, rgba(230,216,255,0.14) 100%)",
              }}
            />
          </div>

          {/* Conteúdo Centralizado */}
          <div className="relative z-10 w-full max-w-[520px] mx-auto flex flex-col min-h-[100dvh] px-[24px] md:px-[32px] lg:px-[24px] pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
            <div className="flex-1 flex flex-col justify-center w-full">
              {logo && (
                <div className="flex justify-center w-full mt-2 mb-[34px]">
                  {logo}
                </div>
              )}
              <div className="w-full flex flex-col">{children}</div>
            </div>
          </div>
        </div>

        {/* PAINEL DIREITO — Branding (Apenas Desktop) */}
        <div className="hidden lg:flex lg:flex-1 relative z-10 flex-col justify-between items-end text-right p-12 h-full">
          <div className="relative z-10 flex items-start"></div>

          <div className="relative z-10 flex flex-col gap-6 items-end justify-end h-full">
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
  },
);
AuthLayout.displayName = "AuthLayout";
