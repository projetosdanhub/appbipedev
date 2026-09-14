"use client";
import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import * as Pop from "@radix-ui/react-popover";
import * as Tip from "@radix-ui/react-tooltip";
import * as Tab from "@radix-ui/react-tabs";
import { cn } from "../lib/utils";

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuContent = ({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.Content>) => (
  <Menu.Portal>
    <Menu.Content
      {...props}
      sideOffset={sideOffset}
      className={cn("ui-popover", className)}
    />
  </Menu.Portal>
);
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Menu.Item>,
  React.ComponentPropsWithoutRef<typeof Menu.Item>
>(({ className, ...props }, ref) => (
  <Menu.Item {...props} ref={ref} className={cn("ui-menu-item", className)} />
));
DropdownMenuItem.displayName = "DropdownMenuItem";
export const DropdownMenuSeparator = () => (
  <Menu.Separator className="ui-separator" />
);
export const DropdownMenuLabel = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.Label>) => (
  <Menu.Label {...props} className={cn("ui-menu-item ui-help", className)} />
);
export const Popover = Pop.Root;
export const PopoverTrigger = Pop.Trigger;
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof Pop.Content>,
  React.ComponentPropsWithoutRef<typeof Pop.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <Pop.Portal>
    <Pop.Content
      {...props}
      sideOffset={sideOffset}
      ref={ref}
      className={cn("ui-popover", className)}
    />
  </Pop.Portal>
));
PopoverContent.displayName = "PopoverContent";
export const TooltipProvider = Tip.Provider;
export const Tooltip = Tip.Root;
export const TooltipTrigger = Tip.Trigger;
export const TooltipContent = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Tip.Content>) => (
  <Tip.Portal>
    <Tip.Content
      {...props}
      sideOffset={8}
      className={cn("ui-tooltip", className)}
    />
  </Tip.Portal>
);
export const Tabs = Tab.Root;
export const TabsList = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Tab.List>) => (
  <Tab.List {...props} className={cn("ui-tabs-list", className)} />
);
export const TabsTrigger = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Tab.Trigger>) => (
  <Tab.Trigger {...props} className={cn("ui-tab", className)} />
);
export const TabsContent = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Tab.Content>) => (
  <Tab.Content {...props} className={cn("ui-tabs-content", className)} />
);
