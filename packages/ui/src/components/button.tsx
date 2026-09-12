import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-[14px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden relative",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] text-white hover:opacity-90 focus-visible:ring-[var(--color-brand-600)]",
        destructive: "bg-[var(--color-danger-600)] text-white hover:bg-red-700 focus-visible:ring-[var(--color-danger-600)]",
        outline: "border border-[var(--color-border-200)] bg-[var(--color-surface-0)] hover:bg-[var(--color-surface-50)] text-[var(--color-ink-900)] focus-visible:ring-[var(--color-brand-600)]",
        secondary: "bg-[var(--color-surface-50)] text-[var(--color-ink-900)] hover:bg-[#E3E8F1] focus-visible:ring-[var(--color-brand-600)]",
        ghost: "hover:bg-[var(--color-surface-50)] text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] focus-visible:ring-[var(--color-brand-600)]",
        link: "text-[var(--color-brand-600)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-brand-600)]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "group")}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {variant === "default" && (
          <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
        )}
        <div className="flex items-center gap-2 relative z-10">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {children}
        </div>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
