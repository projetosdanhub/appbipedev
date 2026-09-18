"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DialogTitle,
  DialogDescription,
  BrandLogo,
} from "@bipesend/ui";
import { navigation, isActiveRoute } from "./navigation";

export function MobileNavigation() {
  const path = usePathname(),
    [open, setOpen] = React.useState(false);
  return (
    <nav className="workspace-mobile-nav" aria-label="Navegação mobile">
      {navigation.slice(0, 3).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="workspace-mobile-nav-link"
          aria-current={isActiveRoute(path, item.href) ? "page" : undefined}
        >
          <item.icon aria-hidden="true" />
          <span>{item.name}</span>
        </Link>
      ))}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="workspace-mobile-nav-link"
            aria-label="Abrir todas as opções do menu"
          >
            <Menu aria-hidden="true" />
            <span>Mais</span>
          </button>
        </DrawerTrigger>
        <DrawerContent className="workspace-mobile-drawer">
          <DialogTitle>Seu workspace</DialogTitle>
          <DialogDescription>
            Acesse todas as áreas do BipeSend.
          </DialogDescription>
          <BrandLogo />
          <div className="workspace-nav">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="workspace-nav-link"
                aria-current={
                  isActiveRoute(path, item.href) ? "page" : undefined
                }
                onClick={() => setOpen(false)}
              >
                <item.icon aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
