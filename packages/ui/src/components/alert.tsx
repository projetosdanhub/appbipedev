import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[10px] border p-4 text-[14px] leading-relaxed flex gap-3",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-surface-50)] text-[var(--color-ink-900)] border-[var(--color-border-200)]",
        destructive:
          "border-[var(--color-danger-200)] text-[var(--color-danger-700)] bg-[var(--color-danger-50)] [&>svg]:text-[var(--color-danger-700)]",
        success:
          "border-[var(--color-success-200)] text-[var(--color-success-700)] bg-[var(--color-success-50)] [&>svg]:text-[var(--color-success-700)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[14px] [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
