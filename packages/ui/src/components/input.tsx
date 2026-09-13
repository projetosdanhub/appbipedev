import * as React from "react"
import { cn } from "../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-[14px] font-medium text-[var(--color-ink-900)] leading-[20px]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 pr-3 text-slate-400 pointer-events-none">
              <div className="flex items-center gap-3">
                {leftIcon}
                <div className="h-6 w-[1px] bg-[var(--color-border-200)]" />
              </div>
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-[54px] md:h-[56px] w-full rounded-[14px] border border-[#DCE5F2] bg-[#FFFFFF] py-2 text-[16px] text-[#07113F] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A1A8B6] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1478FF]/10 focus-visible:border-[#1478FF] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 hover:border-[#1478FF]/50",
              leftIcon ? "pl-[64px]" : "pl-4",
              rightIcon ? "pr-12" : "pr-4",
              error && "border-red-500 focus-visible:ring-red-500/10 focus-visible:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && (
          <span className={cn(
            "text-[13px] leading-[18px]",
            error ? "text-[var(--color-danger-600)]" : "text-[var(--color-ink-600)]"
          )}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
