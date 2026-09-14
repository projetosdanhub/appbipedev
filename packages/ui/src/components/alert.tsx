import * as React from "react";
import { cn } from "../lib/utils";
export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "success";
  }
>(({ className, variant = "default", role, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    role={role ?? (variant === "destructive" ? "alert" : "status")}
    className={cn("ui-alert", `ui-alert-${variant}`, className)}
  />
));
Alert.displayName = "Alert";
export const AlertTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className={cn("ui-alert-title", className)} />
);
export const AlertDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={className} />
);
export const InlineMessage = Alert;
