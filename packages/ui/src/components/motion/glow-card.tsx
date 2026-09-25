import * as React from "react";
import { cn } from "../../lib/utils";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "blue" | "emerald" | "violet" | "amber";
  children?: React.ReactNode;
}

export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ glowColor = "blue", className, children, ...props }, ref) => {
    const glowClass = {
      blue: "hover:border-[#007BFF]/60 hover:shadow-[0_12px_40px_rgba(0,123,255,0.12)]",
      emerald: "hover:border-emerald-500/60 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)]",
      violet: "hover:border-[#6366F1]/60 hover:shadow-[0_12px_40px_rgba(99,102,241,0.12)]",
      amber: "hover:border-amber-500/60 hover:shadow-[0_12px_40px_rgba(245,158,11,0.12)]",
    }[glowColor];

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-[24px] border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1",
          glowClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlowCard.displayName = "GlowCard";
