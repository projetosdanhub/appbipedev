import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-[16px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden relative",
  {
    variants: {
      variant: {
        default: "text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110 active:scale-[0.985] focus-visible:ring-[var(--color-brand-600)]",
        destructive: "bg-[var(--color-danger-600)] text-white hover:bg-red-700 focus-visible:ring-[var(--color-danger-600)] rounded-xl",
        outline: "border border-[var(--color-border-200)] bg-[var(--color-surface-0)] hover:bg-[var(--color-surface-50)] text-[var(--color-ink-900)] focus-visible:ring-[var(--color-brand-600)] rounded-xl",
        secondary: "bg-[var(--color-surface-50)] text-[var(--color-ink-900)] hover:bg-[#E3E8F1] focus-visible:ring-[var(--color-brand-600)] rounded-xl",
        ghost: "hover:bg-[var(--color-surface-50)] text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] focus-visible:ring-[var(--color-brand-600)] rounded-xl",
        link: "text-[var(--color-brand-600)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-brand-600)] rounded-xl",
      },
      size: {
        default: "h-[52px] md:h-[54px] px-5 rounded-xl",
        sm: "h-[44px] rounded-lg px-4 text-[14px]",
        lg: "h-[56px] rounded-xl px-8",
        icon: "h-[52px] w-[52px] rounded-xl",
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
    const isDefault = !variant || variant === "default"
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "group")}
        ref={ref}
        disabled={isLoading || props.disabled}
        style={isDefault ? { background: "linear-gradient(135deg, #007BFF 0%, #6366F1 100%)" } : undefined}
        {...props}
      >
        {isDefault && (
          <span className="absolute inset-0 w-full h-full bg-white/15 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
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
