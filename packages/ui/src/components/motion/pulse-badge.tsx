import * as React from "react";
import { cn } from "../../lib/utils";

export interface PulseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "blue" | "amber" | "violet";
  children?: React.ReactNode;
}

export const PulseBadge = React.forwardRef<HTMLSpanElement, PulseBadgeProps>(
  ({ variant = "emerald", className, children, ...props }, ref) => {
    const colorStyles = {
      emerald: {
        container: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        ping: "bg-emerald-400",
      },
      blue: {
        container: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-[#007BFF]",
        ping: "bg-blue-400",
      },
      amber: {
        container: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        ping: "bg-amber-400",
      },
      violet: {
        container: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dot: "bg-[#6366F1]",
        ping: "bg-indigo-400",
      },
    }[variant];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase shadow-2xs select-none",
          colorStyles.container,
          className
        )}
        {...props}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              colorStyles.ping
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              colorStyles.dot
            )}
          />
        </span>
        <span>{children}</span>
      </span>
    );
  }
);
PulseBadge.displayName = "PulseBadge";
