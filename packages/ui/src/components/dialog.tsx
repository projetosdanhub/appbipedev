"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button, IconButton } from "./button";
import { cn } from "../lib/utils";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Primitive.Title>) => (
  <Primitive.Title {...props} className={cn("ui-dialog-title", className)} />
);
export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
export const DialogDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Primitive.Description>) => (
  <Primitive.Description
    {...props}
    className={cn("ui-dialog-description", className)}
  />
);
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content> & {
    showClose?: boolean;
  }
>(({ className, children, showClose = true, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="ui-overlay" />
    <Primitive.Content
      {...props}
      ref={ref}
      className={cn("ui-dialog", className)}
    >
      {children}
      {showClose && (
        <Primitive.Close asChild>
          <IconButton label="Fechar" className="ui-dialog-close">
            <X aria-hidden="true" />
          </IconButton>
        </Primitive.Close>
      )}
    </Primitive.Content>
  </Primitive.Portal>
));
DialogContent.displayName = "DialogContent";
export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("ui-dialog-footer", className)} />
);
export const Drawer = Dialog;
export const DrawerTrigger = DialogTrigger;
export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent {...props} ref={ref} className={cn("ui-drawer", className)} />
));
DrawerContent.displayName = "DrawerContent";
export const Sheet = Drawer;
export const SheetContent = DrawerContent;

/** Controlled: close only after the caller confirms persistence. Failed mutations stay visible. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm(): void;
  pending?: boolean;
  error?: string;
}) {
  const cancelId = React.useId();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent
        showClose={!pending}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(cancelId)?.focus();
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {error && (
          <p className="ui-error" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            id={cancelId}
            variant="outline"
            size="md"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="md"
            isLoading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
