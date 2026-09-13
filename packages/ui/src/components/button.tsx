import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-[16px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden relative",
  {
    variants: {
      variant: {
        default: "text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110 active:scale-[0.985] focus-visible:ring-[#1478FF]",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 rounded-[14px]",
        outline: "border border-[#DCE5F2] bg-white hover:bg-slate-50 text-[#07113F] focus-visible:ring-[#1478FF] rounded-[14px]",
        secondary: "bg-slate-100 text-[#07113F] hover:bg-slate-200 focus-visible:ring-[#1478FF] rounded-[14px]",
        ghost: "hover:bg-slate-100 text-slate-500 hover:text-[#07113F] focus-visible:ring-[#1478FF] rounded-[14px]",
        link: "text-[#1478FF] underline-offset-4 hover:underline focus-visible:ring-[#1478FF] rounded-[14px]",
        google: "border border-[#DCE5F2] bg-white hover:bg-slate-50 text-[#07113F] focus-visible:ring-[#1478FF] rounded-[14px] shadow-sm",
      },
      size: {
        default: "h-[54px] px-5 rounded-[14px]",
        sm: "h-[44px] rounded-[12px] px-4 text-[14px]",
        lg: "h-[56px] rounded-[14px] px-8",
        icon: "h-[54px] w-[54px] rounded-[14px]",
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
        style={isDefault ? { background: "linear-gradient(100deg, #079CF5 0%, #1478FF 38%, #5759F5 70%, #A827F5 100%)" } : undefined}
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
