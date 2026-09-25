import * as React from "react";
import { cn } from "../../lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerDuration?: string;
  borderRadius?: string;
  background?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "rgba(255, 255, 255, 0.35)",
      shimmerDuration = "2.8s",
      borderRadius = "16px",
      background = "linear-gradient(135deg, #007BFF 0%, #6366F1 100%)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-duration": shimmerDuration,
            "--border-radius": borderRadius,
            "--shimmer-bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative isolate inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(0,123,255,0.25)] transition-all duration-300 active:scale-[0.97] hover:shadow-[0_8px_30px_rgba(0,123,255,0.4)] cursor-pointer",
          className
        )}
        {...props}
      >
        <div
          className="absolute inset-0 -z-20 transition-transform duration-300 group-hover:scale-105"
          style={{ background, borderRadius }}
        />
        {/* Shimmer sweep effect */}
        <div
          className="pointer-events-none absolute -inset-full top-0 -z-10 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer-sweep"
          style={{ borderRadius }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";
