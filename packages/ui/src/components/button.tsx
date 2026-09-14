import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
export const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button-default",
      primary: "ui-button-primary",
      destructive: "ui-button-destructive",
      outline: "ui-button-outline",
      secondary: "ui-button-secondary",
      ghost: "ui-button-ghost",
      link: "ui-button-link",
      google: "ui-button-google",
    },
    size: {
      default: "",
      sm: "ui-button-sm",
      md: "ui-button-md",
      lg: "ui-button-lg",
      icon: "ui-button-icon",
      compact: "ui-button-compact",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      {...props}
      type={type}
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && (
        <Loader2 className="ui-spinner ui-icon" aria-hidden="true" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "size"> & { label: string }
>(({ label, variant = "ghost", ...props }, ref) => (
  <Button
    {...props}
    ref={ref}
    variant={variant}
    size="icon"
    aria-label={label}
  />
));
IconButton.displayName = "IconButton";
