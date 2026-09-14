import * as React from "react";
import { cn } from "../lib/utils";
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={cn("ui-card", className)} />
));
Card.displayName = "Card";
export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-card-header", className)} />
);
export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-card-content", className)} />
);
export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-card-footer", className)} />
);
export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 {...props} className={cn("ui-card-title", className)} />
);
export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className={cn("ui-card-description", className)} />
);
