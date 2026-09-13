import * as React from "react";
import { cn } from "../lib/utils";

export interface GlassPillProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

export const GlassPill = React.forwardRef<HTMLDivElement, GlassPillProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/5 transition-all hover:bg-white/20",
          className
        )}
        {...props}
      >
        {icon && <div className="text-emerald-400 [&_svg]:w-4 [&_svg]:h-4 flex-shrink-0">{icon}</div>}
        <span className="text-white/95 text-[13px] font-medium tracking-wide">{children}</span>
      </div>
    );
  }
);
GlassPill.displayName = "GlassPill";
