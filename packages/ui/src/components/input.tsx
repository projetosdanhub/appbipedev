import * as React from "react"
import { cn } from "../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, leftIcon, id, ...props }, ref) => {
    // auto-generate id if label exists but no id provided
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-[14px] font-medium text-[var(--color-ink-900)] dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-[var(--color-border-200)] dark:border-gray-700 bg-white dark:bg-[var(--color-surface-900)] px-4 py-2 text-[14px] text-[var(--color-ink-900)] dark:text-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#9BA1AC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-600)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600",
              leftIcon && "pl-11",
              error && "border-[var(--color-danger-600)] focus-visible:ring-[var(--color-danger-600)]",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && (
          <span className={cn(
            "text-[12px]",
            error ? "text-[var(--color-danger-600)]" : "text-[var(--color-ink-600)] dark:text-gray-400"
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
