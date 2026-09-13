import * as React from "react";
import { cn } from "../lib/utils";

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
}

export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ className, children, logo, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-[100dvh] w-full flex bg-[#FFFFFF] overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Curva Top-Left */}
        <div 
          className="absolute z-0 pointer-events-none"
          style={{
            top: "-145px",
            left: "-165px",
            width: "clamp(340px, 50vw, 460px)",
            height: "clamp(270px, 40vh, 340px)",
            transform: "rotate(-8deg)"
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              borderRadius: "100%",
              background: "linear-gradient(135deg, rgba(150,201,255,0.34) 0%, rgba(189,210,255,0.20) 58%, rgba(215,207,255,0.12) 100%)"
            }}
          />
        </div>

        {/* Curva Bottom-Right */}
        <div 
          className="absolute z-0 pointer-events-none"
          style={{
            bottom: "-165px",
            right: "-185px",
            width: "clamp(360px, 50vw, 480px)",
            height: "clamp(280px, 40vh, 360px)",
            transform: "rotate(-12deg)"
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              borderRadius: "100%",
              background: "linear-gradient(135deg, rgba(196,218,255,0.16) 0%, rgba(209,198,255,0.24) 62%, rgba(230,216,255,0.14) 100%)"
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
            <div className="w-full flex flex-col">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
AuthLayout.displayName = "AuthLayout";

